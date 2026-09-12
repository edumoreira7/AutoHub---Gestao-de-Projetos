import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

// Utility used to standardize API response structures and common responses across the application.

// Examples:
// Success: { success: true, message: 'Customer created successfully', id: '123' }
// Error: { success: false, message: 'Customer not found' }

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    id?: string;
    data?: T;
}

export function success<T>(message?: string, id?: string, data?: T): ApiResponse<T> {
    return {
        success: true,
        ...(message ? { message } : {}),
        ...(id ? { id } : {}),
        ...(data !== undefined ? { data } : {}),
    };
}

export function badRequest(message?: string): never {
    throw new BadRequestException({
        success: false,
        ...(message ? { message } : {}),
    });
}

export function unauthorized(message?: string): never {
    throw new UnauthorizedException({
        success: false,
        ...(message ? { message } : {}),
    });
}

export function forbidden(message?: string): never {
    throw new ForbiddenException({
        success: false,
        ...(message ? { message } : {}),
    });
}

export function notFound(entity?: string): never {
    throw new NotFoundException({
        success: false,
        ...(entity ? { message: `${entity} não encontrado` } : {}),
    });
}

export function conflict(message?: string): never {
    throw new ConflictException({
        success: false,
        ...(message ? { message } : {}),
    });
}

export function internalServerError(message?: string): never {
    throw new InternalServerErrorException({
        success: false,
        ...(message ? { message } : {}),
    });
}

export function invalid(field: string): never {
    return badRequest(`${field} inválido`);
}

export function required(field: string): never {
    return badRequest(`${field} é obrigatório`);
}

export function requiredBody(): never {
    return required('Corpo da requisição');
}

export function alreadyExists(entity: string): never {
    return conflict(`${entity} já cadastrado`);
}

export function duplicated(entity: string): never {
    return conflict(`${entity} duplicado`);
}