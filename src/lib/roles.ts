// Roluri care au acces la dashboard de business (service, magazin piese, dezmembrări, mixt)
// Toate aceste roluri funcționează identic din punct de vedere al accesului —
// diferența reală e doar business_type pe tabelul services.
export const SERVICE_ROLES = ['service', 'mixt', 'magazin_piese', 'dezmembrari']

export function isServiceRole(role?: string | null): boolean {
  return !!role && SERVICE_ROLES.includes(role)
}
