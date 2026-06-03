export function normalizeName(name: string) {
   return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/\s+/g, " ") // limpa espaços duplicados
      .trim()
      .toUpperCase();
}

export function makeNameKey(name: string) {
   return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .trim()
      .toUpperCase();
}