function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || /change|cambia|hub_iavante_secret/i.test(secret)) {
    throw new Error('JWT_SECRET debe contener al menos 32 caracteres y no ser un valor de ejemplo');
  }
  return secret;
}
module.exports = { getJwtSecret };
