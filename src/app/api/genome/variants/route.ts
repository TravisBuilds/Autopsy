import { NextResponse } from "next/server";
import { rowToGenomeImport, rowToGenomeVariant } from "@/lib/genome/db-mappers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: importRow, error: importError } = await supabase
    .from("genome_imports")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (importError) {
    return NextResponse.json({ error: importError.message }, { status: 500 });
  }

  if (!importRow) {
    return NextResponse.json({ import: null, variants: [] });
  }

  const { data: variantRows, error: variantError } = await supabase
    .from("genome_variants")
    .select("*")
    .eq("import_id", importRow.id)
    .order("importance_score", { ascending: false });

  if (variantError) {
    return NextResponse.json({ error: variantError.message }, { status: 500 });
  }

  return NextResponse.json({
    import: rowToGenomeImport(importRow),
    variants: (variantRows ?? []).map(rowToGenomeVariant),
  });
}
