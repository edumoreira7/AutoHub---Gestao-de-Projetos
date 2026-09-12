export class ClienteCreateDto {
    nomeCompleto!: string;
    cpf!: string;
    telefone!: string;
    email!: string;
    endereco?: string;
}