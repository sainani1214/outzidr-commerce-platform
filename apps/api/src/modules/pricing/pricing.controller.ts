import { FastifyRequest, FastifyReply } from 'fastify';
import { pricingService } from './pricing.service';
import {
  CreatePricingRuleDTO,
  UpdatePricingRuleDTO,
  PricingRuleQuery,
  PriceCalculationRequest,
} from './pricing.types';

export class PricingController {
  async createRule(
    request: FastifyRequest<{ Body: CreatePricingRuleDTO }>,
    reply: FastifyReply
  ) {
    const rule = await pricingService.createRule(request.tenantId, request.body);
    return reply.code(201).send(rule.toPricingRule());
  }

  async getRules(
    request: FastifyRequest<{ Querystring: PricingRuleQuery }>,
    reply: FastifyReply
  ) {
    const result = await pricingService.getRules(request.tenantId, request.query);
    return reply.send(result);
  }

  async getRule(
    request: FastifyRequest<{ Params: { ruleId: string } }>,
    reply: FastifyReply
  ) {
    const rule = await pricingService.getRuleById(request.tenantId, request.params.ruleId);
    
    if (!rule) {
      return reply.code(404).send({ error: 'Pricing rule not found' });
    }

    return reply.send(rule.toPricingRule());
  }

  async updateRule(
    request: FastifyRequest<{
      Params: { ruleId: string };
      Body: UpdatePricingRuleDTO;
    }>,
    reply: FastifyReply
  ) {
    const rule = await pricingService.updateRule(
      request.tenantId,
      request.params.ruleId,
      request.body
    );

    if (!rule) {
      return reply.code(404).send({ error: 'Pricing rule not found' });
    }

    return reply.send(rule.toPricingRule());
  }

  async deleteRule(
    request: FastifyRequest<{ Params: { ruleId: string } }>,
    reply: FastifyReply
  ) {
    const deleted = await pricingService.deleteRule(
      request.tenantId,
      request.params.ruleId
    );

    if (!deleted) {
      return reply.code(404).send({ error: 'Pricing rule not found' });
    }

    return reply.code(204).send();
  }

  async calculatePrice(
    request: FastifyRequest<{ Body: PriceCalculationRequest }>,
    reply: FastifyReply
  ) {
    const result = await pricingService.calculatePrice(request.tenantId, request.body);
    return reply.send(result);
  }
}

export const pricingController = new PricingController();
