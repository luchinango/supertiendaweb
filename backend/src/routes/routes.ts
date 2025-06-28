/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserController } from './../controllers/UserController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SupplierController } from './../controllers/SupplierController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PurchaseOrderController } from './../controllers/PurchaseOrderController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ProductController } from './../controllers/ProductController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CategoryController } from './../controllers/CategoryController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { BusinessProductController } from './../controllers/BusinessProductController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { BusinessController } from './../controllers/BusinessController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from './../controllers/AuthController';
import { expressAuthentication } from './../middlewares/authMiddleware';
// @ts-ignore - no great way to install types from subpackage
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';

const expressAuthenticationRecasted = expressAuthentication as (req: ExRequest, securityName: string, scopes?: string[], res?: ExResponse) => Promise<any>;


// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "_36_Enums.BusinessStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ACTIVE"]},{"dataType":"enum","enums":["INACTIVE"]},{"dataType":"enum","enums":["SUSPENDED"]},{"dataType":"enum","enums":["PENDING"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.Department": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["LA_PAZ"]},{"dataType":"enum","enums":["COCHABAMBA"]},{"dataType":"enum","enums":["SANTA_CRUZ"]},{"dataType":"enum","enums":["ORURO"]},{"dataType":"enum","enums":["POTOSI"]},{"dataType":"enum","enums":["CHUQUISACA"]},{"dataType":"enum","enums":["TARIJA"]},{"dataType":"enum","enums":["BENI"]},{"dataType":"enum","enums":["PANDO"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.BusinessType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["EMPRESA_UNIPERSONAL"]},{"dataType":"enum","enums":["SOCIEDAD_ANONIMA"]},{"dataType":"enum","enums":["SOCIEDAD_LIMITADA"]},{"dataType":"enum","enums":["SOCIEDAD_COOPERATIVA"]},{"dataType":"enum","enums":["EMPRESA_PUBLICA"]},{"dataType":"enum","enums":["ORGANIZACION_NO_LUCRATIVA"]},{"dataType":"enum","enums":["PERSONA_NATURAL"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.Currency": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["BOB"]},{"dataType":"enum","enums":["USD"]},{"dataType":"enum","enums":["EUR"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Decimal": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DefaultSelection_Prisma._36_BusinessPayload_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"defaultTaxRate":{"ref":"Decimal","required":true},"currency":{"ref":"_36_Enums.Currency","required":true},"timezone":{"dataType":"string","required":true},"website":{"dataType":"string","required":true},"logoUrl":{"dataType":"string","required":true},"postalCode":{"dataType":"string","required":true},"country":{"dataType":"string","required":true},"city":{"dataType":"string","required":true},"businessType":{"ref":"_36_Enums.BusinessType","required":true},"nit":{"dataType":"string","required":true},"description":{"dataType":"string","required":true},"legalName":{"dataType":"string","required":true},"deletedBy":{"dataType":"double","required":true},"updatedBy":{"dataType":"double","required":true},"createdBy":{"dataType":"double","required":true},"deletedAt":{"dataType":"datetime","required":true},"address":{"dataType":"string","required":true},"email":{"dataType":"string","required":true},"department":{"ref":"_36_Enums.Department","required":true},"updatedAt":{"dataType":"datetime","required":true},"createdAt":{"dataType":"datetime","required":true},"status":{"ref":"_36_Enums.BusinessStatus","required":true},"phone":{"dataType":"string","required":true},"id":{"dataType":"double","required":true},"name":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BusinessResponse": {
        "dataType": "refObject",
        "properties": {
            "defaultTaxRate": {"ref":"Decimal","required":true},
            "currency": {"ref":"_36_Enums.Currency","required":true},
            "timezone": {"dataType":"string","required":true},
            "website": {"dataType":"string","required":true},
            "logoUrl": {"dataType":"string","required":true},
            "postalCode": {"dataType":"string","required":true},
            "country": {"dataType":"string","required":true},
            "city": {"dataType":"string","required":true},
            "businessType": {"ref":"_36_Enums.BusinessType","required":true},
            "nit": {"dataType":"string","required":true},
            "description": {"dataType":"string","required":true},
            "legalName": {"dataType":"string","required":true},
            "deletedBy": {"dataType":"double","required":true},
            "updatedBy": {"dataType":"double","required":true},
            "createdBy": {"dataType":"double","required":true},
            "deletedAt": {"dataType":"datetime","required":true},
            "address": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "department": {"ref":"_36_Enums.Department","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "status": {"ref":"_36_Enums.BusinessStatus","required":true},
            "phone": {"dataType":"string","required":true},
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.EmployeeStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ACTIVE"]},{"dataType":"enum","enums":["ON_LEAVE"]},{"dataType":"enum","enums":["TERMINATED"]},{"dataType":"enum","enums":["RETIRED"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.Gender": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["MALE"]},{"dataType":"enum","enums":["FEMALE"]},{"dataType":"enum","enums":["OTHER"]},{"dataType":"enum","enums":["UNSPECIFIED"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DefaultSelection_Prisma._36_EmployeePayload_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"deletedBy":{"dataType":"double","required":true},"updatedBy":{"dataType":"double","required":true},"createdBy":{"dataType":"double","required":true},"deletedAt":{"dataType":"datetime","required":true},"ciNumber":{"dataType":"string","required":true},"emergencyPhone":{"dataType":"string","required":true},"emergencyContact":{"dataType":"string","required":true},"address":{"dataType":"string","required":true},"email":{"dataType":"string","required":true},"birthDate":{"dataType":"datetime","required":true},"gender":{"ref":"_36_Enums.Gender","required":true},"salary":{"ref":"Decimal","required":true},"endDate":{"dataType":"datetime","required":true},"startDate":{"dataType":"datetime","required":true},"department":{"dataType":"string","required":true},"position":{"dataType":"string","required":true},"lastName":{"dataType":"string","required":true},"firstName":{"dataType":"string","required":true},"businessId":{"dataType":"double","required":true},"userId":{"dataType":"double","required":true},"updatedAt":{"dataType":"datetime","required":true},"createdAt":{"dataType":"datetime","required":true},"status":{"ref":"_36_Enums.EmployeeStatus","required":true},"phone":{"dataType":"string","required":true},"id":{"dataType":"double","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmployeeResponse": {
        "dataType": "refObject",
        "properties": {
            "deletedBy": {"dataType":"double","required":true},
            "updatedBy": {"dataType":"double","required":true},
            "createdBy": {"dataType":"double","required":true},
            "deletedAt": {"dataType":"datetime","required":true},
            "ciNumber": {"dataType":"string","required":true},
            "emergencyPhone": {"dataType":"string","required":true},
            "emergencyContact": {"dataType":"string","required":true},
            "address": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "birthDate": {"dataType":"datetime","required":true},
            "gender": {"ref":"_36_Enums.Gender","required":true},
            "salary": {"ref":"Decimal","required":true},
            "endDate": {"dataType":"datetime","required":true},
            "startDate": {"dataType":"datetime","required":true},
            "department": {"dataType":"string","required":true},
            "position": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "firstName": {"dataType":"string","required":true},
            "businessId": {"dataType":"double","required":true},
            "userId": {"dataType":"double","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "status": {"ref":"_36_Enums.EmployeeStatus","required":true},
            "phone": {"dataType":"string","required":true},
            "id": {"dataType":"double","required":true},
            "business": {"ref":"BusinessResponse"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.UserStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["PENDING_VERIFICATION"]},{"dataType":"enum","enums":["ACTIVE"]},{"dataType":"enum","enums":["INACTIVE"]},{"dataType":"enum","enums":["SUSPENDED"]},{"dataType":"enum","enums":["LOCKED"]},{"dataType":"enum","enums":["PASSWORD_RESET"]},{"dataType":"enum","enums":["DELETED"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_User.Exclude_keyofUser.passwordHash__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"id":{"dataType":"double","required":true},"username":{"dataType":"string","required":true},"phone":{"dataType":"string","required":true},"status":{"ref":"_36_Enums.UserStatus","required":true},"roleId":{"dataType":"double","required":true},"createdAt":{"dataType":"datetime","required":true},"updatedAt":{"dataType":"datetime","required":true},"lastLogin":{"dataType":"datetime","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "username": {"dataType":"string","required":true},
            "phone": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "status": {"ref":"_36_Enums.UserStatus","required":true},
            "roleId": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "lastLogin": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "role": {"dataType":"nestedObjectLiteral","nestedProperties":{"code":{"dataType":"string","required":true},"name":{"dataType":"string","required":true},"id":{"dataType":"double","required":true}},"required":true},
            "employee": {"dataType":"union","subSchemas":[{"ref":"EmployeeResponse"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginationMeta": {
        "dataType": "refObject",
        "properties": {
            "total": {"dataType":"double","required":true},
            "page": {"dataType":"double","required":true},
            "limit": {"dataType":"double","required":true},
            "totalPages": {"dataType":"double","required":true},
            "hasNextPage": {"dataType":"boolean","required":true},
            "hasPrevPage": {"dataType":"boolean","required":true},
            "nextPage": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "prevPage": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginatedApiResponse_UserResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"UserResponse"},"required":true},
            "meta": {"ref":"PaginationMeta","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ErrorResponse": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"enum","enums":["error"],"required":true},
            "message": {"dataType":"string","required":true},
            "code": {"dataType":"string"},
            "details": {"dataType":"any"},
            "timestamp": {"dataType":"string","required":true},
            "path": {"dataType":"string","required":true},
            "method": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_UserResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"UserResponse","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateUserRequest": {
        "dataType": "refObject",
        "properties": {
            "username": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
            "roleId": {"dataType":"double","required":true},
            "employeeId": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateUserRequest": {
        "dataType": "refObject",
        "properties": {
            "username": {"dataType":"string"},
            "email": {"dataType":"string"},
            "password": {"dataType":"string"},
            "roleId": {"dataType":"double"},
            "employeeId": {"dataType":"double"},
            "isActive": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_null_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"enum","enums":[null],"required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SupplierResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "businessId": {"dataType":"double","required":true},
            "code": {"dataType":"string"},
            "name": {"dataType":"string","required":true},
            "documentType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["NIT"]},{"dataType":"enum","enums":["CI"]},{"dataType":"enum","enums":["PASSPORT"]},{"dataType":"enum","enums":["FOREIGN_ID"]}],"required":true},
            "documentNumber": {"dataType":"string"},
            "contactPerson": {"dataType":"string"},
            "email": {"dataType":"string"},
            "phone": {"dataType":"string"},
            "address": {"dataType":"string"},
            "city": {"dataType":"string"},
            "department": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["LA_PAZ"]},{"dataType":"enum","enums":["COCHABAMBA"]},{"dataType":"enum","enums":["SANTA_CRUZ"]},{"dataType":"enum","enums":["ORURO"]},{"dataType":"enum","enums":["POTOSI"]},{"dataType":"enum","enums":["CHUQUISACA"]},{"dataType":"enum","enums":["TARIJA"]},{"dataType":"enum","enums":["BENI"]},{"dataType":"enum","enums":["PANDO"]}]},
            "country": {"dataType":"string","required":true},
            "postalCode": {"dataType":"string"},
            "paymentTerms": {"dataType":"double","required":true},
            "creditLimit": {"dataType":"double"},
            "currentBalance": {"dataType":"double","required":true},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ACTIVE"]},{"dataType":"enum","enums":["INACTIVE"]},{"dataType":"enum","enums":["SUSPENDED"]}],"required":true},
            "notes": {"dataType":"string"},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "createdBy": {"dataType":"double","required":true},
            "updatedBy": {"dataType":"double","required":true},
            "deletedBy": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginatedApiResponse_SupplierResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"SupplierResponse"},"required":true},
            "meta": {"ref":"PaginationMeta","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_SupplierResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"SupplierResponse","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateSupplierRequestNew": {
        "dataType": "refObject",
        "properties": {
            "businessId": {"dataType":"double"},
            "code": {"dataType":"string"},
            "name": {"dataType":"string","required":true},
            "documentType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["NIT"]},{"dataType":"enum","enums":["CI"]},{"dataType":"enum","enums":["PASSPORT"]},{"dataType":"enum","enums":["FOREIGN_ID"]}]},
            "documentNumber": {"dataType":"string"},
            "contactPerson": {"dataType":"string"},
            "email": {"dataType":"string"},
            "phone": {"dataType":"string"},
            "address": {"dataType":"string"},
            "city": {"dataType":"string"},
            "department": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["LA_PAZ"]},{"dataType":"enum","enums":["COCHABAMBA"]},{"dataType":"enum","enums":["SANTA_CRUZ"]},{"dataType":"enum","enums":["ORURO"]},{"dataType":"enum","enums":["POTOSI"]},{"dataType":"enum","enums":["CHUQUISACA"]},{"dataType":"enum","enums":["TARIJA"]},{"dataType":"enum","enums":["BENI"]},{"dataType":"enum","enums":["PANDO"]}]},
            "country": {"dataType":"string"},
            "postalCode": {"dataType":"string"},
            "paymentTerms": {"dataType":"double"},
            "creditLimit": {"dataType":"double"},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ACTIVE"]},{"dataType":"enum","enums":["INACTIVE"]},{"dataType":"enum","enums":["SUSPENDED"]}]},
            "notes": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateSupplierRequest": {
        "dataType": "refObject",
        "properties": {
            "code": {"dataType":"string"},
            "name": {"dataType":"string"},
            "documentType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["NIT"]},{"dataType":"enum","enums":["CI"]},{"dataType":"enum","enums":["PASSPORT"]},{"dataType":"enum","enums":["FOREIGN_ID"]}]},
            "documentNumber": {"dataType":"string"},
            "contactPerson": {"dataType":"string"},
            "email": {"dataType":"string"},
            "phone": {"dataType":"string"},
            "address": {"dataType":"string"},
            "city": {"dataType":"string"},
            "department": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["LA_PAZ"]},{"dataType":"enum","enums":["COCHABAMBA"]},{"dataType":"enum","enums":["SANTA_CRUZ"]},{"dataType":"enum","enums":["ORURO"]},{"dataType":"enum","enums":["POTOSI"]},{"dataType":"enum","enums":["CHUQUISACA"]},{"dataType":"enum","enums":["TARIJA"]},{"dataType":"enum","enums":["BENI"]},{"dataType":"enum","enums":["PANDO"]}]},
            "country": {"dataType":"string"},
            "postalCode": {"dataType":"string"},
            "paymentTerms": {"dataType":"double"},
            "creditLimit": {"dataType":"double"},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ACTIVE"]},{"dataType":"enum","enums":["INACTIVE"]},{"dataType":"enum","enums":["SUSPENDED"]}]},
            "notes": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SupplierSearchResult": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "code": {"dataType":"string"},
            "documentNumber": {"dataType":"string"},
            "phone": {"dataType":"string"},
            "email": {"dataType":"string"},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ACTIVE"]},{"dataType":"enum","enums":["INACTIVE"]},{"dataType":"enum","enums":["SUSPENDED"]}],"required":true},
            "currentBalance": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_SupplierSearchResult-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"SupplierSearchResult"},"required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_SupplierResponse-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"SupplierResponse"},"required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_any_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"any","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.PurchaseOrderStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["PENDING"]},{"dataType":"enum","enums":["DRAFT"]},{"dataType":"enum","enums":["APPROVED"]},{"dataType":"enum","enums":["ORDERED"]},{"dataType":"enum","enums":["PARTIALLY_RECEIVED"]},{"dataType":"enum","enums":["RECEIVED"]},{"dataType":"enum","enums":["CANCELLED"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PurchaseOrderStatus": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.PurchaseOrderStatus","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PurchaseOrderItemResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "purchaseOrderId": {"dataType":"double","required":true},
            "productId": {"dataType":"double","required":true},
            "quantity": {"dataType":"double","required":true},
            "unitCost": {"dataType":"double","required":true},
            "receivedQuantity": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "product": {"dataType":"any"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PurchaseOrderResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "businessId": {"dataType":"double","required":true},
            "supplierId": {"dataType":"double","required":true},
            "poNumber": {"dataType":"string"},
            "status": {"ref":"PurchaseOrderStatus","required":true},
            "orderDate": {"dataType":"datetime","required":true},
            "expectedDate": {"dataType":"datetime"},
            "receivedDate": {"dataType":"datetime"},
            "subtotal": {"dataType":"double","required":true},
            "taxAmount": {"dataType":"double","required":true},
            "totalAmount": {"dataType":"double","required":true},
            "notes": {"dataType":"string"},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "items": {"dataType":"array","array":{"dataType":"refObject","ref":"PurchaseOrderItemResponse"}},
            "supplier": {"dataType":"any"},
            "business": {"dataType":"any"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginatedApiResponse_PurchaseOrderResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"PurchaseOrderResponse"},"required":true},
            "meta": {"ref":"PaginationMeta","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_PurchaseOrderResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"PurchaseOrderResponse","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreatePurchaseOrderItemRequest": {
        "dataType": "refObject",
        "properties": {
            "productId": {"dataType":"double","required":true},
            "quantity": {"dataType":"double","required":true},
            "unitCost": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreatePurchaseOrderRequest": {
        "dataType": "refObject",
        "properties": {
            "businessId": {"dataType":"double","required":true},
            "supplierId": {"dataType":"double","required":true},
            "poNumber": {"dataType":"string"},
            "orderDate": {"dataType":"datetime"},
            "expectedDate": {"dataType":"datetime"},
            "notes": {"dataType":"string"},
            "items": {"dataType":"array","array":{"dataType":"refObject","ref":"CreatePurchaseOrderItemRequest"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdatePurchaseOrderRequest": {
        "dataType": "refObject",
        "properties": {
            "supplierId": {"dataType":"double"},
            "poNumber": {"dataType":"string"},
            "status": {"ref":"PurchaseOrderStatus"},
            "orderDate": {"dataType":"datetime"},
            "expectedDate": {"dataType":"datetime"},
            "notes": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApprovePurchaseOrderRequest": {
        "dataType": "refObject",
        "properties": {
            "approvedBy": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "categoryId": {"dataType":"double","required":true},
            "sku": {"dataType":"string"},
            "barcode": {"dataType":"string"},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "brand": {"dataType":"string"},
            "model": {"dataType":"string"},
            "unit": {"dataType":"string"},
            "weight": {"dataType":"double"},
            "dimensions": {"dataType":"string"},
            "costPrice": {"dataType":"double","required":true},
            "sellingPrice": {"dataType":"double","required":true},
            "taxType": {"dataType":"string","required":true},
            "taxRate": {"dataType":"double","required":true},
            "minStock": {"dataType":"double","required":true},
            "maxStock": {"dataType":"double"},
            "reorderPoint": {"dataType":"double","required":true},
            "isActive": {"dataType":"boolean","required":true},
            "status": {"dataType":"string","required":true},
            "expiryDate": {"dataType":"string"},
            "createdAt": {"dataType":"string","required":true},
            "updatedAt": {"dataType":"string","required":true},
            "deletedAt": {"dataType":"string"},
            "createdBy": {"dataType":"double","required":true},
            "updatedBy": {"dataType":"double","required":true},
            "deletedBy": {"dataType":"double"},
            "category": {"dataType":"nestedObjectLiteral","nestedProperties":{"description":{"dataType":"string"},"name":{"dataType":"string","required":true},"id":{"dataType":"double","required":true}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginatedApiResponse_ProductResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"ProductResponse"},"required":true},
            "meta": {"ref":"PaginationMeta","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_ProductResponse-or-string_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"union","subSchemas":[{"ref":"ProductResponse"},{"dataType":"string"}],"required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_ProductResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"ProductResponse","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_string_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"string","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateProductRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "categoryId": {"dataType":"double","required":true},
            "sku": {"dataType":"string"},
            "barcode": {"dataType":"string"},
            "description": {"dataType":"string"},
            "brand": {"dataType":"string"},
            "model": {"dataType":"string"},
            "unit": {"dataType":"string"},
            "weight": {"dataType":"double"},
            "dimensions": {"dataType":"string"},
            "costPrice": {"dataType":"double","required":true},
            "sellingPrice": {"dataType":"double","required":true},
            "taxType": {"dataType":"string"},
            "taxRate": {"dataType":"double"},
            "minStock": {"dataType":"double"},
            "maxStock": {"dataType":"double"},
            "reorderPoint": {"dataType":"double"},
            "isActive": {"dataType":"boolean"},
            "status": {"dataType":"string"},
            "expiryDate": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateProductRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "categoryId": {"dataType":"double"},
            "sku": {"dataType":"string"},
            "barcode": {"dataType":"string"},
            "description": {"dataType":"string"},
            "brand": {"dataType":"string"},
            "model": {"dataType":"string"},
            "unit": {"dataType":"string"},
            "weight": {"dataType":"double"},
            "dimensions": {"dataType":"string"},
            "costPrice": {"dataType":"double"},
            "sellingPrice": {"dataType":"double"},
            "taxType": {"dataType":"string"},
            "taxRate": {"dataType":"double"},
            "minStock": {"dataType":"double"},
            "maxStock": {"dataType":"double"},
            "reorderPoint": {"dataType":"double"},
            "isActive": {"dataType":"boolean"},
            "status": {"dataType":"string"},
            "expiryDate": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductSearchResult": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "sku": {"dataType":"string"},
            "barcode": {"dataType":"string"},
            "brand": {"dataType":"string"},
            "sellingPrice": {"dataType":"double","required":true},
            "status": {"dataType":"string","required":true},
            "category": {"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string","required":true},"id":{"dataType":"double","required":true}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_ProductSearchResult-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"ProductSearchResult"},"required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_ProductResponse-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"ProductResponse"},"required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductStats": {
        "dataType": "refObject",
        "properties": {
            "totalProducts": {"dataType":"double","required":true},
            "activeProducts": {"dataType":"double","required":true},
            "inactiveProducts": {"dataType":"double","required":true},
            "discontinuedProducts": {"dataType":"double","required":true},
            "outOfStockProducts": {"dataType":"double","required":true},
            "lowStockProducts": {"dataType":"double","required":true},
            "averagePrice": {"dataType":"double","required":true},
            "totalValue": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_ProductStats_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"ProductStats","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse__exists-boolean__": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"exists":{"dataType":"boolean","required":true}},"required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CategoryResponse": {
        "dataType": "refObject",
        "properties": {
            "sortOrder": {"dataType":"double","required":true},
            "isActive": {"dataType":"boolean","required":true},
            "parentId": {"dataType":"double","required":true},
            "description": {"dataType":"string","required":true},
            "deletedBy": {"dataType":"double","required":true},
            "updatedBy": {"dataType":"double","required":true},
            "createdBy": {"dataType":"double","required":true},
            "deletedAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "productCount": {"dataType":"double"},
            "children": {"dataType":"array","array":{"dataType":"refObject","ref":"CategoryResponse"}},
            "parent": {"ref":"CategoryResponse"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DefaultSelection_Prisma._36_CategoryPayload_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"sortOrder":{"dataType":"double","required":true},"isActive":{"dataType":"boolean","required":true},"parentId":{"dataType":"double","required":true},"description":{"dataType":"string","required":true},"deletedBy":{"dataType":"double","required":true},"updatedBy":{"dataType":"double","required":true},"createdBy":{"dataType":"double","required":true},"deletedAt":{"dataType":"datetime","required":true},"updatedAt":{"dataType":"datetime","required":true},"createdAt":{"dataType":"datetime","required":true},"id":{"dataType":"double","required":true},"name":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginatedApiResponse_CategoryResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"CategoryResponse"},"required":true},
            "meta": {"ref":"PaginationMeta","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_CategoryResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"CategoryResponse","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateCategoryRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "parentId": {"dataType":"double"},
            "isActive": {"dataType":"boolean"},
            "sortOrder": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateCategoryRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "description": {"dataType":"string"},
            "parentId": {"dataType":"double"},
            "isActive": {"dataType":"boolean"},
            "sortOrder": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CategoryTreeNode": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "isActive": {"dataType":"boolean","required":true},
            "sortOrder": {"dataType":"double","required":true},
            "productCount": {"dataType":"double","required":true},
            "children": {"dataType":"array","array":{"dataType":"refObject","ref":"CategoryTreeNode"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_CategoryTreeNode-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"CategoryTreeNode"},"required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_CategoryResponse-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"CategoryResponse"},"required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CategoryStats": {
        "dataType": "refObject",
        "properties": {
            "totalCategories": {"dataType":"double","required":true},
            "activeCategories": {"dataType":"double","required":true},
            "inactiveCategories": {"dataType":"double","required":true},
            "categoriesWithProducts": {"dataType":"double","required":true},
            "averageProductsPerCategory": {"dataType":"double","required":true},
            "topCategoriesByProducts": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"productCount":{"dataType":"double","required":true},"name":{"dataType":"string","required":true},"id":{"dataType":"double","required":true}}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_CategoryStats_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"CategoryStats","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_CategoryResponse-or-null_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"union","subSchemas":[{"ref":"CategoryResponse"},{"dataType":"enum","enums":[null]}],"required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BusinessProductCatalogItem": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "categoryId": {"dataType":"double","required":true},
            "sku": {"dataType":"string"},
            "barcode": {"dataType":"string"},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "brand": {"dataType":"string"},
            "model": {"dataType":"string"},
            "unit": {"dataType":"string"},
            "weight": {"dataType":"double"},
            "dimensions": {"dataType":"string"},
            "taxType": {"dataType":"string","required":true},
            "taxRate": {"dataType":"double","required":true},
            "minStock": {"dataType":"double","required":true},
            "maxStock": {"dataType":"double"},
            "reorderPoint": {"dataType":"double","required":true},
            "isActive": {"dataType":"boolean","required":true},
            "status": {"dataType":"string","required":true},
            "expiryDate": {"dataType":"string"},
            "category": {"dataType":"nestedObjectLiteral","nestedProperties":{"description":{"dataType":"string"},"name":{"dataType":"string","required":true},"id":{"dataType":"double","required":true}}},
            "businessProduct": {"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"updatedAt":{"dataType":"datetime","required":true},"createdAt":{"dataType":"datetime","required":true},"lastRestock":{"dataType":"datetime"},"availableStock":{"dataType":"double","required":true},"reservedStock":{"dataType":"double","required":true},"currentStock":{"dataType":"double","required":true},"customPrice":{"dataType":"double","required":true},"businessId":{"dataType":"double","required":true},"id":{"dataType":"double","required":true}}},{"dataType":"enum","enums":[null]}]},
            "effectivePrice": {"dataType":"double","required":true},
            "effectiveStock": {"dataType":"double","required":true},
            "isAvailableInBusiness": {"dataType":"boolean","required":true},
            "stockStatus": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["IN_STOCK"]},{"dataType":"enum","enums":["LOW_STOCK"]},{"dataType":"enum","enums":["OUT_OF_STOCK"]},{"dataType":"enum","enums":["NOT_CONFIGURED"]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BusinessProductCatalogResponse": {
        "dataType": "refObject",
        "properties": {
            "items": {"dataType":"array","array":{"dataType":"refObject","ref":"BusinessProductCatalogItem"},"required":true},
            "meta": {"ref":"PaginationMeta","required":true},
            "summary": {"dataType":"nestedObjectLiteral","nestedProperties":{"outOfStockProducts":{"dataType":"double","required":true},"lowStockProducts":{"dataType":"double","required":true},"inStockProducts":{"dataType":"double","required":true},"notConfiguredProducts":{"dataType":"double","required":true},"configuredProducts":{"dataType":"double","required":true},"totalProducts":{"dataType":"double","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_BusinessProductCatalogResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"BusinessProductCatalogResponse","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BulkConfigureProductsResponse": {
        "dataType": "refObject",
        "properties": {
            "configured": {"dataType":"double","required":true},
            "skipped": {"dataType":"double","required":true},
            "errors": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_BulkConfigureProductsResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"BulkConfigureProductsResponse","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BulkConfigureProductsRequest": {
        "dataType": "refObject",
        "properties": {
            "businessId": {"dataType":"double","required":true},
            "productIds": {"dataType":"array","array":{"dataType":"double"},"required":true},
            "defaultCustomPrice": {"dataType":"double"},
            "defaultStock": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BusinessProductResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "businessId": {"dataType":"double","required":true},
            "productId": {"dataType":"double","required":true},
            "customPrice": {"dataType":"double","required":true},
            "currentStock": {"dataType":"double","required":true},
            "reservedStock": {"dataType":"double","required":true},
            "availableStock": {"dataType":"double","required":true},
            "lastRestock": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "product": {"ref":"ProductResponse"},
            "business": {"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string","required":true},"id":{"dataType":"double","required":true}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginatedApiResponse_BusinessProductResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"BusinessProductResponse"},"required":true},
            "meta": {"ref":"PaginationMeta","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BusinessProductSearchResult": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "businessId": {"dataType":"double","required":true},
            "productId": {"dataType":"double","required":true},
            "productName": {"dataType":"string","required":true},
            "productSku": {"dataType":"string"},
            "productBarcode": {"dataType":"string"},
            "customPrice": {"dataType":"double","required":true},
            "currentStock": {"dataType":"double","required":true},
            "availableStock": {"dataType":"double","required":true},
            "category": {"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string","required":true},"id":{"dataType":"double","required":true}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_BusinessProductSearchResult-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"BusinessProductSearchResult"},"required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_BusinessProductResponse-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"BusinessProductResponse"},"required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BusinessProductStats": {
        "dataType": "refObject",
        "properties": {
            "totalProducts": {"dataType":"double","required":true},
            "totalStockValue": {"dataType":"double","required":true},
            "averageStockLevel": {"dataType":"double","required":true},
            "lowStockProducts": {"dataType":"double","required":true},
            "outOfStockProducts": {"dataType":"double","required":true},
            "recentlyRestockedProducts": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_BusinessProductStats_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"BusinessProductStats","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_BusinessProductResponse-or-null_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"union","subSchemas":[{"ref":"BusinessProductResponse"},{"dataType":"enum","enums":[null]}],"required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateBusinessProductRequest": {
        "dataType": "refObject",
        "properties": {
            "businessId": {"dataType":"double","required":true},
            "productId": {"dataType":"double","required":true},
            "customPrice": {"dataType":"double","required":true},
            "currentStock": {"dataType":"double"},
            "reservedStock": {"dataType":"double"},
            "availableStock": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateBusinessProductRequest": {
        "dataType": "refObject",
        "properties": {
            "customPrice": {"dataType":"double"},
            "currentStock": {"dataType":"double"},
            "reservedStock": {"dataType":"double"},
            "availableStock": {"dataType":"double"},
            "lastRestock": {"dataType":"datetime"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "StockAdjustmentRequest": {
        "dataType": "refObject",
        "properties": {
            "quantity": {"dataType":"double","required":true},
            "reason": {"dataType":"string","required":true},
            "notes": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RestockRequest": {
        "dataType": "refObject",
        "properties": {
            "quantity": {"dataType":"double","required":true},
            "unitCost": {"dataType":"double"},
            "reason": {"dataType":"string"},
            "notes": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginatedApiResponse_BusinessResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"BusinessResponse"},"required":true},
            "meta": {"ref":"PaginationMeta","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_BusinessResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"BusinessResponse","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateBusinessRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "legalName": {"dataType":"string"},
            "description": {"dataType":"string"},
            "nit": {"dataType":"string"},
            "businessType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["EMPRESA_UNIPERSONAL"]},{"dataType":"enum","enums":["SOCIEDAD_ANONIMA"]},{"dataType":"enum","enums":["SOCIEDAD_LIMITADA"]},{"dataType":"enum","enums":["SOCIEDAD_COOPERATIVA"]},{"dataType":"enum","enums":["EMPRESA_PUBLICA"]},{"dataType":"enum","enums":["ORGANIZACION_NO_LUCRATIVA"]},{"dataType":"enum","enums":["PERSONA_NATURAL"]}]},
            "email": {"dataType":"string"},
            "phone": {"dataType":"string"},
            "address": {"dataType":"string"},
            "city": {"dataType":"string"},
            "department": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["LA_PAZ"]},{"dataType":"enum","enums":["COCHABAMBA"]},{"dataType":"enum","enums":["SANTA_CRUZ"]},{"dataType":"enum","enums":["ORURO"]},{"dataType":"enum","enums":["POTOSI"]},{"dataType":"enum","enums":["CHUQUISACA"]},{"dataType":"enum","enums":["TARIJA"]},{"dataType":"enum","enums":["BENI"]},{"dataType":"enum","enums":["PANDO"]}]},
            "country": {"dataType":"string"},
            "postalCode": {"dataType":"string"},
            "logoUrl": {"dataType":"string"},
            "website": {"dataType":"string"},
            "timezone": {"dataType":"string"},
            "currency": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["BOB"]},{"dataType":"enum","enums":["USD"]},{"dataType":"enum","enums":["EUR"]}]},
            "defaultTaxRate": {"dataType":"double"},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ACTIVE"]},{"dataType":"enum","enums":["INACTIVE"]},{"dataType":"enum","enums":["SUSPENDED"]},{"dataType":"enum","enums":["PENDING"]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateBusinessRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "legalName": {"dataType":"string"},
            "description": {"dataType":"string"},
            "nit": {"dataType":"string"},
            "businessType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["EMPRESA_UNIPERSONAL"]},{"dataType":"enum","enums":["SOCIEDAD_ANONIMA"]},{"dataType":"enum","enums":["SOCIEDAD_LIMITADA"]},{"dataType":"enum","enums":["SOCIEDAD_COOPERATIVA"]},{"dataType":"enum","enums":["EMPRESA_PUBLICA"]},{"dataType":"enum","enums":["ORGANIZACION_NO_LUCRATIVA"]},{"dataType":"enum","enums":["PERSONA_NATURAL"]}]},
            "email": {"dataType":"string"},
            "phone": {"dataType":"string"},
            "address": {"dataType":"string"},
            "city": {"dataType":"string"},
            "department": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["LA_PAZ"]},{"dataType":"enum","enums":["COCHABAMBA"]},{"dataType":"enum","enums":["SANTA_CRUZ"]},{"dataType":"enum","enums":["ORURO"]},{"dataType":"enum","enums":["POTOSI"]},{"dataType":"enum","enums":["CHUQUISACA"]},{"dataType":"enum","enums":["TARIJA"]},{"dataType":"enum","enums":["BENI"]},{"dataType":"enum","enums":["PANDO"]}]},
            "country": {"dataType":"string"},
            "postalCode": {"dataType":"string"},
            "logoUrl": {"dataType":"string"},
            "website": {"dataType":"string"},
            "timezone": {"dataType":"string"},
            "currency": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["BOB"]},{"dataType":"enum","enums":["USD"]},{"dataType":"enum","enums":["EUR"]}]},
            "defaultTaxRate": {"dataType":"double"},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ACTIVE"]},{"dataType":"enum","enums":["INACTIVE"]},{"dataType":"enum","enums":["SUSPENDED"]},{"dataType":"enum","enums":["PENDING"]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_BusinessProductResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"BusinessProductResponse","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmployeeStatus": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.EmployeeStatus","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Gender": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.Gender","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthResponse": {
        "dataType": "refObject",
        "properties": {
            "token": {"dataType":"string","required":true},
            "refreshToken": {"dataType":"string","required":true},
            "user": {"dataType":"nestedObjectLiteral","nestedProperties":{"employee":{"dataType":"nestedObjectLiteral","nestedProperties":{"businessId":{"dataType":"double","required":true},"phone":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"address":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"email":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"birthDate":{"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},"gender":{"ref":"Gender","required":true},"status":{"ref":"EmployeeStatus","required":true},"startDate":{"dataType":"datetime","required":true},"position":{"dataType":"string","required":true},"lastName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"firstName":{"dataType":"string","required":true}}},"role":{"dataType":"string","required":true},"username":{"dataType":"string","required":true},"id":{"dataType":"double","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_AuthResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"AuthResponse","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginRequestBody": {
        "dataType": "refObject",
        "properties": {
            "username": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RefreshTokenRequestBody": {
        "dataType": "refObject",
        "properties": {
            "refreshToken": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ChangePasswordRequestBody": {
        "dataType": "refObject",
        "properties": {
            "currentPassword": {"dataType":"string","required":true},
            "newPassword": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserStatus": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.UserStatus","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Department": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.Department","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BusinessType": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.BusinessType","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BusinessStatus": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.BusinessStatus","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VerifyTokenResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "username": {"dataType":"string","required":true},
            "phone": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "status": {"ref":"UserStatus","required":true},
            "roleId": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "lastLogin": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "role": {"dataType":"nestedObjectLiteral","nestedProperties":{"code":{"dataType":"string","required":true},"name":{"dataType":"string","required":true},"id":{"dataType":"double","required":true}},"required":true},
            "employee": {"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"business":{"dataType":"nestedObjectLiteral","nestedProperties":{"status":{"ref":"BusinessStatus","required":true},"businessType":{"ref":"BusinessType","required":true},"country":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"department":{"ref":"Department","required":true},"city":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"address":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"phone":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"email":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"nit":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"legalName":{"dataType":"string","required":true},"name":{"dataType":"string","required":true},"id":{"dataType":"double","required":true}},"required":true},"businessId":{"dataType":"double","required":true},"status":{"ref":"EmployeeStatus","required":true},"emergencyPhone":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"emergencyContact":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"ciNumber":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"phone":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"address":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"email":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"birthDate":{"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},"gender":{"ref":"Gender","required":true},"salary":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"endDate":{"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},"startDate":{"dataType":"datetime","required":true},"department":{"dataType":"string","required":true},"position":{"dataType":"string","required":true},"lastName":{"dataType":"string","required":true},"firstName":{"dataType":"string","required":true},"id":{"dataType":"double","required":true}}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_VerifyTokenResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"VerifyTokenResponse","required":true},
            "message": {"dataType":"string"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsUserController_getUsers: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"in":"query","name":"page","dataType":"double"},
                limit: {"in":"query","name":"limit","dataType":"double"},
                search: {"in":"query","name":"search","dataType":"string"},
                sortBy: {"in":"query","name":"sortBy","dataType":"string"},
                sortOrder: {"in":"query","name":"sortOrder","dataType":"union","subSchemas":[{"dataType":"enum","enums":["asc"]},{"dataType":"enum","enums":["desc"]}]},
                status: {"in":"query","name":"status","dataType":"string"},
                roleId: {"in":"query","name":"roleId","dataType":"double"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
        };
        app.get('/users',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.getUsers)),

            async function UserController_getUsers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_getUsers, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'getUsers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_getUserById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/users/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.getUserById)),

            async function UserController_getUserById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_getUserById, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'getUserById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_createUser: Record<string, TsoaRoute.ParameterSchema> = {
                userData: {"in":"body","name":"userData","required":true,"ref":"CreateUserRequest"},
        };
        app.post('/users',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.createUser)),

            async function UserController_createUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_createUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'createUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_updateUser: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                userData: {"in":"body","name":"userData","required":true,"ref":"UpdateUserRequest"},
        };
        app.put('/users/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.updateUser)),

            async function UserController_updateUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_updateUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'updateUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_deleteUser: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/users/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.deleteUser)),

            async function UserController_deleteUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_deleteUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'deleteUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_getSuppliers: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                search: {"in":"query","name":"search","dataType":"string"},
                sortBy: {"in":"query","name":"sortBy","dataType":"string"},
                sortOrder: {"in":"query","name":"sortOrder","dataType":"union","subSchemas":[{"dataType":"enum","enums":["asc"]},{"dataType":"enum","enums":["desc"]}]},
                status: {"in":"query","name":"status","dataType":"union","subSchemas":[{"dataType":"enum","enums":["ACTIVE"]},{"dataType":"enum","enums":["INACTIVE"]},{"dataType":"enum","enums":["SUSPENDED"]}]},
                department: {"in":"query","name":"department","dataType":"union","subSchemas":[{"dataType":"enum","enums":["LA_PAZ"]},{"dataType":"enum","enums":["COCHABAMBA"]},{"dataType":"enum","enums":["SANTA_CRUZ"]},{"dataType":"enum","enums":["ORURO"]},{"dataType":"enum","enums":["POTOSI"]},{"dataType":"enum","enums":["CHUQUISACA"]},{"dataType":"enum","enums":["TARIJA"]},{"dataType":"enum","enums":["BENI"]},{"dataType":"enum","enums":["PANDO"]}]},
                documentType: {"in":"query","name":"documentType","dataType":"union","subSchemas":[{"dataType":"enum","enums":["NIT"]},{"dataType":"enum","enums":["CI"]},{"dataType":"enum","enums":["PASSPORT"]},{"dataType":"enum","enums":["FOREIGN_ID"]}]},
                minCreditLimit: {"in":"query","name":"minCreditLimit","dataType":"double"},
                maxCreditLimit: {"in":"query","name":"maxCreditLimit","dataType":"double"},
                minBalance: {"in":"query","name":"minBalance","dataType":"double"},
                maxBalance: {"in":"query","name":"maxBalance","dataType":"double"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/suppliers',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.getSuppliers)),

            async function SupplierController_getSuppliers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_getSuppliers, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'getSuppliers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_getSupplierById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/suppliers/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.getSupplierById)),

            async function SupplierController_getSupplierById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_getSupplierById, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'getSupplierById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_createSupplier: Record<string, TsoaRoute.ParameterSchema> = {
                supplierData: {"in":"body","name":"supplierData","required":true,"ref":"CreateSupplierRequestNew"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.post('/suppliers',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.createSupplier)),

            async function SupplierController_createSupplier(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_createSupplier, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'createSupplier',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_updateSupplier: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                supplierData: {"in":"body","name":"supplierData","required":true,"ref":"UpdateSupplierRequest"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.put('/suppliers/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.updateSupplier)),

            async function SupplierController_updateSupplier(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_updateSupplier, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'updateSupplier',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_deleteSupplier: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.delete('/suppliers/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.deleteSupplier)),

            async function SupplierController_deleteSupplier(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_deleteSupplier, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'deleteSupplier',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_searchSuppliers: Record<string, TsoaRoute.ParameterSchema> = {
                query: {"in":"query","name":"query","required":true,"dataType":"string"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/suppliers/search',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.searchSuppliers)),

            async function SupplierController_searchSuppliers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_searchSuppliers, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'searchSuppliers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_activateSupplier: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.put('/suppliers/:id/activate',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.activateSupplier)),

            async function SupplierController_activateSupplier(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_activateSupplier, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'activateSupplier',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_deactivateSupplier: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.put('/suppliers/:id/deactivate',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.deactivateSupplier)),

            async function SupplierController_deactivateSupplier(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_deactivateSupplier, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'deactivateSupplier',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_suspendSupplier: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.put('/suppliers/:id/suspend',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.suspendSupplier)),

            async function SupplierController_suspendSupplier(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_suspendSupplier, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'suspendSupplier',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_getSuppliersWithDebt: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/suppliers/with-debt',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.getSuppliersWithDebt)),

            async function SupplierController_getSuppliersWithDebt(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_getSuppliersWithDebt, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'getSuppliersWithDebt',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_getSupplierStats: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/suppliers/stats',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.getSupplierStats)),

            async function SupplierController_getSupplierStats(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_getSupplierStats, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'getSupplierStats',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_getSuppliersByStatus: Record<string, TsoaRoute.ParameterSchema> = {
                status: {"in":"path","name":"status","required":true,"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ACTIVE"]},{"dataType":"enum","enums":["INACTIVE"]},{"dataType":"enum","enums":["SUSPENDED"]}]},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/suppliers/by-status/:status',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.getSuppliersByStatus)),

            async function SupplierController_getSuppliersByStatus(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_getSuppliersByStatus, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'getSuppliersByStatus',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_getSuppliersByDepartment: Record<string, TsoaRoute.ParameterSchema> = {
                department: {"in":"path","name":"department","required":true,"dataType":"union","subSchemas":[{"dataType":"enum","enums":["LA_PAZ"]},{"dataType":"enum","enums":["COCHABAMBA"]},{"dataType":"enum","enums":["SANTA_CRUZ"]},{"dataType":"enum","enums":["ORURO"]},{"dataType":"enum","enums":["POTOSI"]},{"dataType":"enum","enums":["CHUQUISACA"]},{"dataType":"enum","enums":["TARIJA"]},{"dataType":"enum","enums":["BENI"]},{"dataType":"enum","enums":["PANDO"]}]},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/suppliers/by-department/:department',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.getSuppliersByDepartment)),

            async function SupplierController_getSuppliersByDepartment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_getSuppliersByDepartment, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'getSuppliersByDepartment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPurchaseOrderController_getPurchaseOrders: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                search: {"in":"query","name":"search","dataType":"string"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                status: {"in":"query","name":"status","ref":"PurchaseOrderStatus"},
                supplierId: {"in":"query","name":"supplierId","dataType":"double"},
        };
        app.get('/purchase-orders',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController)),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController.prototype.getPurchaseOrders)),

            async function PurchaseOrderController_getPurchaseOrders(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPurchaseOrderController_getPurchaseOrders, request, response });

                const controller = new PurchaseOrderController();

              await templateService.apiHandler({
                methodName: 'getPurchaseOrders',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPurchaseOrderController_getPurchaseOrderById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/purchase-orders/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController)),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController.prototype.getPurchaseOrderById)),

            async function PurchaseOrderController_getPurchaseOrderById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPurchaseOrderController_getPurchaseOrderById, request, response });

                const controller = new PurchaseOrderController();

              await templateService.apiHandler({
                methodName: 'getPurchaseOrderById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPurchaseOrderController_createPurchaseOrder: Record<string, TsoaRoute.ParameterSchema> = {
                data: {"in":"body","name":"data","required":true,"ref":"CreatePurchaseOrderRequest"},
        };
        app.post('/purchase-orders',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController)),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController.prototype.createPurchaseOrder)),

            async function PurchaseOrderController_createPurchaseOrder(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPurchaseOrderController_createPurchaseOrder, request, response });

                const controller = new PurchaseOrderController();

              await templateService.apiHandler({
                methodName: 'createPurchaseOrder',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPurchaseOrderController_updatePurchaseOrder: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                data: {"in":"body","name":"data","required":true,"ref":"UpdatePurchaseOrderRequest"},
        };
        app.put('/purchase-orders/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController)),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController.prototype.updatePurchaseOrder)),

            async function PurchaseOrderController_updatePurchaseOrder(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPurchaseOrderController_updatePurchaseOrder, request, response });

                const controller = new PurchaseOrderController();

              await templateService.apiHandler({
                methodName: 'updatePurchaseOrder',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPurchaseOrderController_deletePurchaseOrder: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/purchase-orders/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController)),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController.prototype.deletePurchaseOrder)),

            async function PurchaseOrderController_deletePurchaseOrder(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPurchaseOrderController_deletePurchaseOrder, request, response });

                const controller = new PurchaseOrderController();

              await templateService.apiHandler({
                methodName: 'deletePurchaseOrder',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPurchaseOrderController_approvePurchaseOrder: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                data: {"in":"body","name":"data","required":true,"ref":"ApprovePurchaseOrderRequest"},
        };
        app.patch('/purchase-orders/:id/approve',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController)),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController.prototype.approvePurchaseOrder)),

            async function PurchaseOrderController_approvePurchaseOrder(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPurchaseOrderController_approvePurchaseOrder, request, response });

                const controller = new PurchaseOrderController();

              await templateService.apiHandler({
                methodName: 'approvePurchaseOrder',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPurchaseOrderController_getPurchaseOrdersByStatus: Record<string, TsoaRoute.ParameterSchema> = {
                status: {"in":"path","name":"status","required":true,"ref":"PurchaseOrderStatus"},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
        };
        app.get('/purchase-orders/status/:status',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController)),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController.prototype.getPurchaseOrdersByStatus)),

            async function PurchaseOrderController_getPurchaseOrdersByStatus(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPurchaseOrderController_getPurchaseOrdersByStatus, request, response });

                const controller = new PurchaseOrderController();

              await templateService.apiHandler({
                methodName: 'getPurchaseOrdersByStatus',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPurchaseOrderController_getPurchaseOrdersBySupplier: Record<string, TsoaRoute.ParameterSchema> = {
                supplierId: {"in":"path","name":"supplierId","required":true,"dataType":"double"},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                status: {"in":"query","name":"status","ref":"PurchaseOrderStatus"},
        };
        app.get('/purchase-orders/supplier/:supplierId',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController)),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController.prototype.getPurchaseOrdersBySupplier)),

            async function PurchaseOrderController_getPurchaseOrdersBySupplier(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPurchaseOrderController_getPurchaseOrdersBySupplier, request, response });

                const controller = new PurchaseOrderController();

              await templateService.apiHandler({
                methodName: 'getPurchaseOrdersBySupplier',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPurchaseOrderController_getPurchaseOrdersByBusiness: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"path","name":"businessId","required":true,"dataType":"double"},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                status: {"in":"query","name":"status","ref":"PurchaseOrderStatus"},
                supplierId: {"in":"query","name":"supplierId","dataType":"double"},
        };
        app.get('/purchase-orders/business/:businessId',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController)),
            ...(fetchMiddlewares<RequestHandler>(PurchaseOrderController.prototype.getPurchaseOrdersByBusiness)),

            async function PurchaseOrderController_getPurchaseOrdersByBusiness(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPurchaseOrderController_getPurchaseOrdersByBusiness, request, response });

                const controller = new PurchaseOrderController();

              await templateService.apiHandler({
                methodName: 'getPurchaseOrdersByBusiness',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_getProducts: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                search: {"in":"query","name":"search","dataType":"string"},
                categoryId: {"in":"query","name":"categoryId","dataType":"double"},
                status: {"in":"query","name":"status","dataType":"string"},
                isActive: {"in":"query","name":"isActive","dataType":"boolean"},
                minStock: {"in":"query","name":"minStock","dataType":"double"},
                maxStock: {"in":"query","name":"maxStock","dataType":"double"},
                minPrice: {"in":"query","name":"minPrice","dataType":"double"},
                maxPrice: {"in":"query","name":"maxPrice","dataType":"double"},
                brand: {"in":"query","name":"brand","dataType":"string"},
                taxType: {"in":"query","name":"taxType","dataType":"string"},
                sortBy: {"in":"query","name":"sortBy","dataType":"string"},
                sortOrder: {"in":"query","name":"sortOrder","dataType":"union","subSchemas":[{"dataType":"enum","enums":["asc"]},{"dataType":"enum","enums":["desc"]}]},
        };
        app.get('/products',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.getProducts)),

            async function ProductController_getProducts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_getProducts, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'getProducts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_getProductById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/products/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.getProductById)),

            async function ProductController_getProductById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_getProductById, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'getProductById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_createProduct: Record<string, TsoaRoute.ParameterSchema> = {
                productData: {"in":"body","name":"productData","required":true,"ref":"CreateProductRequest"},
        };
        app.post('/products',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.createProduct)),

            async function ProductController_createProduct(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_createProduct, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'createProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_updateProduct: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                productData: {"in":"body","name":"productData","required":true,"ref":"UpdateProductRequest"},
        };
        app.put('/products/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.updateProduct)),

            async function ProductController_updateProduct(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_updateProduct, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'updateProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_deleteProduct: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/products/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.deleteProduct)),

            async function ProductController_deleteProduct(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_deleteProduct, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'deleteProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_searchProducts: Record<string, TsoaRoute.ParameterSchema> = {
                q: {"in":"query","name":"q","required":true,"dataType":"string"},
        };
        app.get('/products/search',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.searchProducts)),

            async function ProductController_searchProducts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_searchProducts, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'searchProducts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_activateProduct: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.put('/products/:id/activate',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.activateProduct)),

            async function ProductController_activateProduct(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_activateProduct, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'activateProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_deactivateProduct: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.put('/products/:id/deactivate',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.deactivateProduct)),

            async function ProductController_deactivateProduct(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_deactivateProduct, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'deactivateProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_discontinueProduct: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.put('/products/:id/discontinue',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.discontinueProduct)),

            async function ProductController_discontinueProduct(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_discontinueProduct, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'discontinueProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_markOutOfStock: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.put('/products/:id/out-of-stock',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.markOutOfStock)),

            async function ProductController_markOutOfStock(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_markOutOfStock, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'markOutOfStock',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_getProductsByCategory: Record<string, TsoaRoute.ParameterSchema> = {
                categoryId: {"in":"path","name":"categoryId","required":true,"dataType":"double"},
        };
        app.get('/products/category/:categoryId',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.getProductsByCategory)),

            async function ProductController_getProductsByCategory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_getProductsByCategory, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'getProductsByCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_getProductsByStatus: Record<string, TsoaRoute.ParameterSchema> = {
                status: {"in":"path","name":"status","required":true,"dataType":"string"},
        };
        app.get('/products/status/:status',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.getProductsByStatus)),

            async function ProductController_getProductsByStatus(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_getProductsByStatus, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'getProductsByStatus',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_getProductsByBrand: Record<string, TsoaRoute.ParameterSchema> = {
                brand: {"in":"path","name":"brand","required":true,"dataType":"string"},
        };
        app.get('/products/brand/:brand',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.getProductsByBrand)),

            async function ProductController_getProductsByBrand(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_getProductsByBrand, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'getProductsByBrand',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_getProductsLowStock: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/products/low-stock',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.getProductsLowStock)),

            async function ProductController_getProductsLowStock(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_getProductsLowStock, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'getProductsLowStock',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_getProductsOutOfStock: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/products/out-of-stock',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.getProductsOutOfStock)),

            async function ProductController_getProductsOutOfStock(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_getProductsOutOfStock, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'getProductsOutOfStock',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_getProductStats: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/products/stats',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.getProductStats)),

            async function ProductController_getProductStats(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_getProductStats, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'getProductStats',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_validateSku: Record<string, TsoaRoute.ParameterSchema> = {
                sku: {"in":"query","name":"sku","required":true,"dataType":"string"},
                excludeId: {"in":"query","name":"excludeId","dataType":"double"},
        };
        app.get('/products/validate/sku',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.validateSku)),

            async function ProductController_validateSku(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_validateSku, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'validateSku',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_validateBarcode: Record<string, TsoaRoute.ParameterSchema> = {
                barcode: {"in":"query","name":"barcode","required":true,"dataType":"string"},
                excludeId: {"in":"query","name":"excludeId","dataType":"double"},
        };
        app.get('/products/validate/barcode',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.validateBarcode)),

            async function ProductController_validateBarcode(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_validateBarcode, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'validateBarcode',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_getCategories: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                search: {"in":"query","name":"search","dataType":"string"},
                isActive: {"in":"query","name":"isActive","dataType":"boolean"},
                parentId: {"in":"query","name":"parentId","dataType":"double"},
                hasProducts: {"in":"query","name":"hasProducts","dataType":"boolean"},
                sortBy: {"in":"query","name":"sortBy","dataType":"string"},
                sortOrder: {"in":"query","name":"sortOrder","dataType":"union","subSchemas":[{"dataType":"enum","enums":["asc"]},{"dataType":"enum","enums":["desc"]}]},
        };
        app.get('/categories',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.getCategories)),

            async function CategoryController_getCategories(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_getCategories, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'getCategories',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_getCategoryById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/categories/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.getCategoryById)),

            async function CategoryController_getCategoryById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_getCategoryById, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'getCategoryById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_createCategory: Record<string, TsoaRoute.ParameterSchema> = {
                categoryData: {"in":"body","name":"categoryData","required":true,"ref":"CreateCategoryRequest"},
        };
        app.post('/categories',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.createCategory)),

            async function CategoryController_createCategory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_createCategory, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'createCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_updateCategory: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                categoryData: {"in":"body","name":"categoryData","required":true,"ref":"UpdateCategoryRequest"},
        };
        app.put('/categories/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.updateCategory)),

            async function CategoryController_updateCategory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_updateCategory, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'updateCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_deleteCategory: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/categories/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.deleteCategory)),

            async function CategoryController_deleteCategory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_deleteCategory, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'deleteCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_getCategoryTree: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/categories/tree',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.getCategoryTree)),

            async function CategoryController_getCategoryTree(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_getCategoryTree, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'getCategoryTree',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_getCategoryChildren: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/categories/:id/children',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.getCategoryChildren)),

            async function CategoryController_getCategoryChildren(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_getCategoryChildren, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'getCategoryChildren',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_activateCategory: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.put('/categories/:id/activate',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.activateCategory)),

            async function CategoryController_activateCategory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_activateCategory, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'activateCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_deactivateCategory: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.put('/categories/:id/deactivate',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.deactivateCategory)),

            async function CategoryController_deactivateCategory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_deactivateCategory, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'deactivateCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_getCategoryStats: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/categories/stats',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.getCategoryStats)),

            async function CategoryController_getCategoryStats(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_getCategoryStats, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'getCategoryStats',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_searchCategoryByName: Record<string, TsoaRoute.ParameterSchema> = {
                name: {"in":"path","name":"name","required":true,"dataType":"string"},
        };
        app.get('/categories/search/:name',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.searchCategoryByName)),

            async function CategoryController_searchCategoryByName(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_searchCategoryByName, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'searchCategoryByName',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_getBusinessProductCatalogForCurrentUser: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":20,"in":"query","name":"limit","dataType":"double"},
                categoryId: {"in":"query","name":"categoryId","dataType":"double"},
                search: {"in":"query","name":"search","dataType":"string"},
                isActive: {"in":"query","name":"isActive","dataType":"boolean"},
                stockStatus: {"in":"query","name":"stockStatus","dataType":"union","subSchemas":[{"dataType":"enum","enums":["IN_STOCK"]},{"dataType":"enum","enums":["LOW_STOCK"]},{"dataType":"enum","enums":["OUT_OF_STOCK"]},{"dataType":"enum","enums":["NOT_CONFIGURED"]}]},
                isConfigured: {"in":"query","name":"isConfigured","dataType":"boolean"},
                brand: {"in":"query","name":"brand","dataType":"string"},
                minPrice: {"in":"query","name":"minPrice","dataType":"double"},
                maxPrice: {"in":"query","name":"maxPrice","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/business-products/catalog',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.getBusinessProductCatalogForCurrentUser)),

            async function BusinessProductController_getBusinessProductCatalogForCurrentUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_getBusinessProductCatalogForCurrentUser, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'getBusinessProductCatalogForCurrentUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_getProductsByCategoryForCurrentUser: Record<string, TsoaRoute.ParameterSchema> = {
                categoryId: {"in":"path","name":"categoryId","required":true,"dataType":"double"},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":50,"in":"query","name":"limit","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/business-products/catalog/category/:categoryId',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.getProductsByCategoryForCurrentUser)),

            async function BusinessProductController_getProductsByCategoryForCurrentUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_getProductsByCategoryForCurrentUser, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'getProductsByCategoryForCurrentUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_getCatalogStatsForCurrentUser: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/business-products/catalog/stats',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.getCatalogStatsForCurrentUser)),

            async function BusinessProductController_getCatalogStatsForCurrentUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_getCatalogStatsForCurrentUser, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'getCatalogStatsForCurrentUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_bulkConfigureProducts: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"body","name":"request","required":true,"ref":"BulkConfigureProductsRequest"},
                expressRequest: {"in":"request","name":"expressRequest","dataType":"object"},
        };
        app.post('/business-products/catalog/bulk-configure',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.bulkConfigureProducts)),

            async function BusinessProductController_bulkConfigureProducts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_bulkConfigureProducts, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'bulkConfigureProducts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_getBusinessProductCatalog: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"path","name":"businessId","required":true,"dataType":"double"},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":20,"in":"query","name":"limit","dataType":"double"},
                categoryId: {"in":"query","name":"categoryId","dataType":"double"},
                search: {"in":"query","name":"search","dataType":"string"},
                isActive: {"in":"query","name":"isActive","dataType":"boolean"},
                stockStatus: {"in":"query","name":"stockStatus","dataType":"union","subSchemas":[{"dataType":"enum","enums":["IN_STOCK"]},{"dataType":"enum","enums":["LOW_STOCK"]},{"dataType":"enum","enums":["OUT_OF_STOCK"]},{"dataType":"enum","enums":["NOT_CONFIGURED"]}]},
                isConfigured: {"in":"query","name":"isConfigured","dataType":"boolean"},
                brand: {"in":"query","name":"brand","dataType":"string"},
                minPrice: {"in":"query","name":"minPrice","dataType":"double"},
                maxPrice: {"in":"query","name":"maxPrice","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/business-products/catalog/:businessId',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.getBusinessProductCatalog)),

            async function BusinessProductController_getBusinessProductCatalog(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_getBusinessProductCatalog, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'getBusinessProductCatalog',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_getProductsByCategoryForBusiness: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"path","name":"businessId","required":true,"dataType":"double"},
                categoryId: {"in":"path","name":"categoryId","required":true,"dataType":"double"},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":50,"in":"query","name":"limit","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/business-products/catalog/:businessId/category/:categoryId',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.getProductsByCategoryForBusiness)),

            async function BusinessProductController_getProductsByCategoryForBusiness(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_getProductsByCategoryForBusiness, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'getProductsByCategoryForBusiness',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_getCatalogStats: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"path","name":"businessId","required":true,"dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/business-products/catalog/:businessId/stats',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.getCatalogStats)),

            async function BusinessProductController_getCatalogStats(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_getCatalogStats, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'getCatalogStats',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_getBusinessProducts: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                productId: {"in":"query","name":"productId","dataType":"double"},
                minStock: {"in":"query","name":"minStock","dataType":"double"},
                maxStock: {"in":"query","name":"maxStock","dataType":"double"},
                minPrice: {"in":"query","name":"minPrice","dataType":"double"},
                maxPrice: {"in":"query","name":"maxPrice","dataType":"double"},
                categoryId: {"in":"query","name":"categoryId","dataType":"double"},
                brand: {"in":"query","name":"brand","dataType":"string"},
                lowStock: {"in":"query","name":"lowStock","dataType":"boolean"},
                outOfStock: {"in":"query","name":"outOfStock","dataType":"boolean"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/business-products',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.getBusinessProducts)),

            async function BusinessProductController_getBusinessProducts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_getBusinessProducts, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'getBusinessProducts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_searchBusinessProducts: Record<string, TsoaRoute.ParameterSchema> = {
                query: {"in":"query","name":"query","required":true,"dataType":"string"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/business-products/search',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.searchBusinessProducts)),

            async function BusinessProductController_searchBusinessProducts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_searchBusinessProducts, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'searchBusinessProducts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_checkBusinessProductExists: Record<string, TsoaRoute.ParameterSchema> = {
                productId: {"in":"query","name":"productId","required":true,"dataType":"double"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/business-products/exists',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.checkBusinessProductExists)),

            async function BusinessProductController_checkBusinessProductExists(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_checkBusinessProductExists, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'checkBusinessProductExists',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_getProductsByBusiness: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"path","name":"businessId","required":true,"dataType":"double"},
        };
        app.get('/business-products/business/:businessId',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.getProductsByBusiness)),

            async function BusinessProductController_getProductsByBusiness(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_getProductsByBusiness, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'getProductsByBusiness',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_getLowStockProducts: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"path","name":"businessId","required":true,"dataType":"double"},
                threshold: {"in":"query","name":"threshold","dataType":"double"},
        };
        app.get('/business-products/business/:businessId/low-stock',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.getLowStockProducts)),

            async function BusinessProductController_getLowStockProducts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_getLowStockProducts, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'getLowStockProducts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_getOutOfStockProducts: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"path","name":"businessId","required":true,"dataType":"double"},
        };
        app.get('/business-products/business/:businessId/out-of-stock',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.getOutOfStockProducts)),

            async function BusinessProductController_getOutOfStockProducts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_getOutOfStockProducts, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'getOutOfStockProducts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_getRecentlyRestockedProducts: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"path","name":"businessId","required":true,"dataType":"double"},
                days: {"in":"query","name":"days","dataType":"double"},
        };
        app.get('/business-products/business/:businessId/recently-restocked',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.getRecentlyRestockedProducts)),

            async function BusinessProductController_getRecentlyRestockedProducts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_getRecentlyRestockedProducts, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'getRecentlyRestockedProducts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_getBusinessProductStats: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"path","name":"businessId","required":true,"dataType":"double"},
        };
        app.get('/business-products/business/:businessId/stats',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.getBusinessProductStats)),

            async function BusinessProductController_getBusinessProductStats(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_getBusinessProductStats, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'getBusinessProductStats',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_getBusinessProductByBusinessAndProduct: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"path","name":"businessId","required":true,"dataType":"double"},
                productId: {"in":"path","name":"productId","required":true,"dataType":"double"},
        };
        app.get('/business-products/business/:businessId/product/:productId',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.getBusinessProductByBusinessAndProduct)),

            async function BusinessProductController_getBusinessProductByBusinessAndProduct(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_getBusinessProductByBusinessAndProduct, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'getBusinessProductByBusinessAndProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_getBusinessesByProduct: Record<string, TsoaRoute.ParameterSchema> = {
                productId: {"in":"path","name":"productId","required":true,"dataType":"double"},
        };
        app.get('/business-products/product/:productId',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.getBusinessesByProduct)),

            async function BusinessProductController_getBusinessesByProduct(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_getBusinessesByProduct, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'getBusinessesByProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_getProductsByCategory: Record<string, TsoaRoute.ParameterSchema> = {
                categoryId: {"in":"path","name":"categoryId","required":true,"dataType":"double"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/business-products/category/:categoryId',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.getProductsByCategory)),

            async function BusinessProductController_getProductsByCategory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_getProductsByCategory, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'getProductsByCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_getProductsByBrand: Record<string, TsoaRoute.ParameterSchema> = {
                brand: {"in":"path","name":"brand","required":true,"dataType":"string"},
                businessId: {"in":"query","name":"businessId","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/business-products/brand/:brand',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.getProductsByBrand)),

            async function BusinessProductController_getProductsByBrand(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_getProductsByBrand, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'getProductsByBrand',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_getBusinessProductById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/business-products/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.getBusinessProductById)),

            async function BusinessProductController_getBusinessProductById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_getBusinessProductById, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'getBusinessProductById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_createBusinessProduct: Record<string, TsoaRoute.ParameterSchema> = {
                data: {"in":"body","name":"data","required":true,"ref":"CreateBusinessProductRequest"},
        };
        app.post('/business-products',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.createBusinessProduct)),

            async function BusinessProductController_createBusinessProduct(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_createBusinessProduct, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'createBusinessProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_updateBusinessProduct: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                data: {"in":"body","name":"data","required":true,"ref":"UpdateBusinessProductRequest"},
        };
        app.put('/business-products/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.updateBusinessProduct)),

            async function BusinessProductController_updateBusinessProduct(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_updateBusinessProduct, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'updateBusinessProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_updateBusinessProductByBusinessAndProduct: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"path","name":"businessId","required":true,"dataType":"double"},
                productId: {"in":"path","name":"productId","required":true,"dataType":"double"},
                data: {"in":"body","name":"data","required":true,"ref":"UpdateBusinessProductRequest"},
        };
        app.put('/business-products/business/:businessId/product/:productId',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.updateBusinessProductByBusinessAndProduct)),

            async function BusinessProductController_updateBusinessProductByBusinessAndProduct(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_updateBusinessProductByBusinessAndProduct, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'updateBusinessProductByBusinessAndProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_adjustStock: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                adjustment: {"in":"body","name":"adjustment","required":true,"ref":"StockAdjustmentRequest"},
        };
        app.put('/business-products/:id/adjust-stock',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.adjustStock)),

            async function BusinessProductController_adjustStock(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_adjustStock, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'adjustStock',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_restockProduct: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                restockData: {"in":"body","name":"restockData","required":true,"ref":"RestockRequest"},
        };
        app.put('/business-products/:id/restock',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.restockProduct)),

            async function BusinessProductController_restockProduct(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_restockProduct, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'restockProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_deleteBusinessProduct: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/business-products/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.deleteBusinessProduct)),

            async function BusinessProductController_deleteBusinessProduct(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_deleteBusinessProduct, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'deleteBusinessProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessProductController_deleteBusinessProductByBusinessAndProduct: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"path","name":"businessId","required":true,"dataType":"double"},
                productId: {"in":"path","name":"productId","required":true,"dataType":"double"},
        };
        app.delete('/business-products/business/:businessId/product/:productId',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessProductController.prototype.deleteBusinessProductByBusinessAndProduct)),

            async function BusinessProductController_deleteBusinessProductByBusinessAndProduct(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessProductController_deleteBusinessProductByBusinessAndProduct, request, response });

                const controller = new BusinessProductController();

              await templateService.apiHandler({
                methodName: 'deleteBusinessProductByBusinessAndProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessController_getBusinesses: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                search: {"in":"query","name":"search","dataType":"string"},
                status: {"in":"query","name":"status","dataType":"union","subSchemas":[{"dataType":"enum","enums":["ACTIVE"]},{"dataType":"enum","enums":["INACTIVE"]},{"dataType":"enum","enums":["SUSPENDED"]},{"dataType":"enum","enums":["PENDING"]}]},
                businessType: {"in":"query","name":"businessType","dataType":"union","subSchemas":[{"dataType":"enum","enums":["EMPRESA_UNIPERSONAL"]},{"dataType":"enum","enums":["SOCIEDAD_ANONIMA"]},{"dataType":"enum","enums":["SOCIEDAD_LIMITADA"]},{"dataType":"enum","enums":["SOCIEDAD_COOPERATIVA"]},{"dataType":"enum","enums":["EMPRESA_PUBLICA"]},{"dataType":"enum","enums":["ORGANIZACION_NO_LUCRATIVA"]},{"dataType":"enum","enums":["PERSONA_NATURAL"]}]},
                department: {"in":"query","name":"department","dataType":"union","subSchemas":[{"dataType":"enum","enums":["LA_PAZ"]},{"dataType":"enum","enums":["COCHABAMBA"]},{"dataType":"enum","enums":["SANTA_CRUZ"]},{"dataType":"enum","enums":["ORURO"]},{"dataType":"enum","enums":["POTOSI"]},{"dataType":"enum","enums":["CHUQUISACA"]},{"dataType":"enum","enums":["TARIJA"]},{"dataType":"enum","enums":["BENI"]},{"dataType":"enum","enums":["PANDO"]}]},
        };
        app.get('/businesses',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessController.prototype.getBusinesses)),

            async function BusinessController_getBusinesses(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessController_getBusinesses, request, response });

                const controller = new BusinessController();

              await templateService.apiHandler({
                methodName: 'getBusinesses',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessController_getBusinessById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/businesses/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessController.prototype.getBusinessById)),

            async function BusinessController_getBusinessById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessController_getBusinessById, request, response });

                const controller = new BusinessController();

              await templateService.apiHandler({
                methodName: 'getBusinessById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessController_createBusiness: Record<string, TsoaRoute.ParameterSchema> = {
                businessData: {"in":"body","name":"businessData","required":true,"ref":"CreateBusinessRequest"},
        };
        app.post('/businesses',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessController.prototype.createBusiness)),

            async function BusinessController_createBusiness(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessController_createBusiness, request, response });

                const controller = new BusinessController();

              await templateService.apiHandler({
                methodName: 'createBusiness',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessController_updateBusiness: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                businessData: {"in":"body","name":"businessData","required":true,"ref":"UpdateBusinessRequest"},
        };
        app.put('/businesses/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessController.prototype.updateBusiness)),

            async function BusinessController_updateBusiness(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessController_updateBusiness, request, response });

                const controller = new BusinessController();

              await templateService.apiHandler({
                methodName: 'updateBusiness',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessController_deleteBusiness: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/businesses/:id',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessController.prototype.deleteBusiness)),

            async function BusinessController_deleteBusiness(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessController_deleteBusiness, request, response });

                const controller = new BusinessController();

              await templateService.apiHandler({
                methodName: 'deleteBusiness',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessController_getBusinessProducts: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"path","name":"businessId","required":true,"dataType":"double"},
        };
        app.get('/businesses/:businessId/products',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessController.prototype.getBusinessProducts)),

            async function BusinessController_getBusinessProducts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessController_getBusinessProducts, request, response });

                const controller = new BusinessController();

              await templateService.apiHandler({
                methodName: 'getBusinessProducts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessController_addProductToBusiness: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"path","name":"businessId","required":true,"dataType":"double"},
                productData: {"in":"body","name":"productData","required":true,"ref":"CreateBusinessProductRequest"},
        };
        app.post('/businesses/:businessId/products',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessController.prototype.addProductToBusiness)),

            async function BusinessController_addProductToBusiness(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessController_addProductToBusiness, request, response });

                const controller = new BusinessController();

              await templateService.apiHandler({
                methodName: 'addProductToBusiness',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessController_updateBusinessProduct: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"path","name":"businessId","required":true,"dataType":"double"},
                productId: {"in":"path","name":"productId","required":true,"dataType":"double"},
                productData: {"in":"body","name":"productData","required":true,"ref":"UpdateBusinessProductRequest"},
        };
        app.put('/businesses/:businessId/products/:productId',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessController.prototype.updateBusinessProduct)),

            async function BusinessController_updateBusinessProduct(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessController_updateBusinessProduct, request, response });

                const controller = new BusinessController();

              await templateService.apiHandler({
                methodName: 'updateBusinessProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBusinessController_removeProductFromBusiness: Record<string, TsoaRoute.ParameterSchema> = {
                businessId: {"in":"path","name":"businessId","required":true,"dataType":"double"},
                productId: {"in":"path","name":"productId","required":true,"dataType":"double"},
        };
        app.delete('/businesses/:businessId/products/:productId',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(BusinessController)),
            ...(fetchMiddlewares<RequestHandler>(BusinessController.prototype.removeProductFromBusiness)),

            async function BusinessController_removeProductFromBusiness(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBusinessController_removeProductFromBusiness, request, response });

                const controller = new BusinessController();

              await templateService.apiHandler({
                methodName: 'removeProductFromBusiness',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_login: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"LoginRequestBody"},
        };
        app.post('/auth/login',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.login)),

            async function AuthController_login(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_login, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'login',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_refreshToken: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"RefreshTokenRequestBody"},
        };
        app.post('/auth/refresh',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.refreshToken)),

            async function AuthController_refreshToken(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_refreshToken, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'refreshToken',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_changePassword: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"ChangePasswordRequestBody"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/auth/change-password',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.changePassword)),

            async function AuthController_changePassword(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_changePassword, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'changePassword',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_verifyToken: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/auth/verify',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.verifyToken)),

            async function AuthController_verifyToken(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_verifyToken, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'verifyToken',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_test: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"any"},
        };
        app.post('/auth/test',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.test)),

            async function AuthController_test(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_test, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'test',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return async function runAuthenticationMiddleware(request: any, response: any, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts: any[] = [];
            const pushAndRethrow = (error: any) => {
                failedAttempts.push(error);
                throw error;
            };

            const secMethodOrPromises: Promise<any>[] = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        secMethodAndPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }

                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                } else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }
                }
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            try {
                request['user'] = await Promise.any(secMethodOrPromises);

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }

                next();
            }
            catch(err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next(error);
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
