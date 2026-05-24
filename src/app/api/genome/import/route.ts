import { NextResponse } from "next/server";
import { rowToGenomeImport, rowToGenomeVariant, variantInputToRow } from "@/lib/genome/db-mappers";
import { readGenomePayloadFromRequest } from "@/lib/genome/validate";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Awaited<ReturnType<typeof readGenomePayloadFromRequest>>;
  try {
    payload = await readGenomePayloadFromRequest(request);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid genome payload" },
      { status: 400 }
    );
  }

  const { variants, sourceFileName } = payload;
  const interpretationVersion = variants[0]?.interpretation_version ?? "unknown";
  const lastInterpretedAt = variants[0]?.last_interpreted_at ?? null;

  const { error: clearError } = await supabase
    .from("genome_imports")
    .delete()
    .eq("user_id", user.id);

  if (clearError) {
    return NextResponse.json({ error: clearError.message }, { status: 500 });
  }

  const importId = crypto.randomUUID();
  const { data: importRow, error: importError } = await supabase
    .from("genome_imports")
    .insert({
      id: importId,
      user_id: user.id,
      source_file_name: sourceFileName ?? null,
      variant_count: variants.length,
      interpretation_version: interpretationVersion,
      last_interpreted_at: lastInterpretedAt,
    })
    .select()
    .single();

  if (importError || !importRow) {
    return NextResponse.json({ error: importError?.message ?? "Import failed" }, { status: 500 });
  }

  const variantRows = variants.map((variant) => variantInputToRow(user.id, importId, variant));
  const { data: insertedVariants, error: variantError } = await supabase
    .from("genome_variants")
    .insert(variantRows)
    .select();

  if (variantError) {
    await supabase.from("genome_imports").delete().eq("id", importId);
    return NextResponse.json({ error: variantError.message }, { status: 500 });
  }

  const variantsOut = (insertedVariants ?? [])
    .map(rowToGenomeVariant)
    .sort((a, b) => b.importanceScore - a.importanceScore);

  return NextResponse.json({
    import: rowToGenomeImport(importRow),
    variants: variantsOut,
  });
}
