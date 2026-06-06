export function keyRequestIntro(count: number): string {
  return count === 1
    ? 'Este membro solicitou a chave.'
    : 'Estes membros solicitaram a chave.'
}
