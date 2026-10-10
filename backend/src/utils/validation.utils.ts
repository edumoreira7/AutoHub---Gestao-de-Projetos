export function isValidCpf(cpf: string): boolean {
    const rawCpf = /^\d{11}$/.test(cpf);
    const formattedCpf = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
    return rawCpf || formattedCpf;
}

export function isValidPhone(phone: string): boolean {
    const rawPhone = /^\d{11}$/.test(phone);
    const formattedPhone = /^\(\d{2}\) ?\d{5}-\d{4}$/.test(phone);
    return rawPhone || formattedPhone;
}

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}