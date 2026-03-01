import { FastifyRequest, FastifyReply } from 'fastify';
import { tenantService } from './tenant.service';
import { CreateTenantDTO, UpdateTenantDTO, TenantQuery } from './tenant.types';

export class TenantController {
  async createTenant(
    request: FastifyRequest<{ Body: CreateTenantDTO }>,
    reply: FastifyReply
  ) {
    const tenant = await tenantService.createTenant(request.body);
    return reply.code(201).send(tenant);
  }

  async resolveTenantSlug(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply
  ) {
    const tenant = await tenantService.getTenantBySlug(request.params.slug);
    return reply.send(tenant);
  }

  async getTenant(
    request: FastifyRequest<{ Params: { tenantId: string } }>,
    reply: FastifyReply
  ) {
    const tenant = await tenantService.getTenantById(request.params.tenantId);
    return reply.send(tenant);
  }

  async getTenants(
    request: FastifyRequest<{ Querystring: TenantQuery }>,
    reply: FastifyReply
  ) {
    const result = await tenantService.getTenants(request.query);
    return reply.send(result);
  }

  async updateTenant(
    request: FastifyRequest<{
      Params: { tenantId: string };
      Body: UpdateTenantDTO;
    }>,
    reply: FastifyReply
  ) {
    const tenant = await tenantService.updateTenant(
      request.params.tenantId,
      request.body
    );
    return reply.send(tenant);
  }

  async deleteTenant(
    request: FastifyRequest<{ Params: { tenantId: string } }>,
    reply: FastifyReply
  ) {
    await tenantService.deleteTenant(request.params.tenantId);
    return reply.code(204).send();
  }
}

export const tenantController = new TenantController();
