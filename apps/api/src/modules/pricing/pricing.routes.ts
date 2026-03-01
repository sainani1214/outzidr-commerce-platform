import { FastifyInstance } from 'fastify';
import { pricingController } from './pricing.controller';
import {
    createPricingRuleSchema,
    getPricingRulesSchema,
    getPricingRuleSchema,
    updatePricingRuleSchema,
    deletePricingRuleSchema,
    calculatePriceSchema,
} from '../../schemas/pricing.schemas';


export async function pricingRoutes(app: FastifyInstance) {
    app.post(
        '/rules',
        {
            schema: createPricingRuleSchema,
        },
        pricingController.createRule.bind(pricingController)
    );

    app.get(
        '/rules',
        {
            schema: getPricingRulesSchema,
        },
        pricingController.getRules.bind(pricingController)
    );

    app.get(
        '/rules/:ruleId',
        {
            schema: getPricingRuleSchema,
        },
        pricingController.getRule.bind(pricingController)
    );

    app.put(
        '/rules/:ruleId',
        {
            schema: updatePricingRuleSchema,
        },
        pricingController.updateRule.bind(pricingController)
    );

    app.delete(
        '/rules/:ruleId',
        {
            schema: deletePricingRuleSchema,
        },
        pricingController.deleteRule.bind(pricingController)
    );

    app.post(
        '/calculate',
        {
            schema: calculatePriceSchema,
        },
        pricingController.calculatePrice.bind(pricingController)
    );
}
