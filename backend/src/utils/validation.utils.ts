import { onlyDigits } from "./string.utils.js";

export function isValidCpf(cpf: string): boolean {
    cpf = onlyDigits(cpf);
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    const calculateDigit = (length: number): number => {
        let sum = 0;

        for (let i = 0; i < length; i++)
            sum += Number(cpf[i]) * (length + 1 - i);

        const remainder = (sum * 10) % 11;
        return remainder === 10 ? 0 : remainder;
    };

    return (
        calculateDigit(9) === Number(cpf[9])
        && calculateDigit(10) === Number(cpf[10])
    );
}

export function isValidPhone(phone: string): boolean {
    const normalizedPhone = phone.replace(/\D/g, '');
    return /^\d{10,11}$/.test(normalizedPhone);
}

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}