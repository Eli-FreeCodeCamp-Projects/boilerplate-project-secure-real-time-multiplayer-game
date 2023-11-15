import Joi from 'joi'

const sharedTypes = {
    id: Joi.alternatives().try(
        Joi.string()
            .guid()
            .min(6)
            .max(60),
        Joi.number()
            .integer()
            .min(1)
            .max(999999999999999)
    ).required(),
    nullableInteger: Joi.number()
        .integer()
        .min(0)
        .max(999999999999999),

    positiveInteger: Joi.number()
        .integer()
        .min(1)
        .max(999999999999999),
    strAlphanum: Joi.alternatives().try(
        Joi.string()
            .valid(''),
        Joi.string()
            .alphanum()
            .min(0)
            .max(30),
        ),
    strAlphanumKey: Joi.string()
        .pattern(/(?=\w{1,30}$)^([a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*)$/)
        .min(0)
        .max(30),
    validDirection: Joi.string()
        .valid('up', 'down', 'left', 'right')
}

const playerSchema = Joi.object({
    name: sharedTypes.strAlphanum,
    id: sharedTypes.id,
    x: sharedTypes.nullableInteger.required(),
    y: sharedTypes.nullableInteger.required(),
    speed: sharedTypes.positiveInteger,
    score: sharedTypes.nullableInteger,
    main: Joi.boolean(),
})

const playersSchema = Joi.array().items(playerSchema)

const collectibleSchema = Joi.object({
    id: sharedTypes.id,
    x: sharedTypes.nullableInteger.required(),
    y: sharedTypes.nullableInteger.required(),
    value: sharedTypes.positiveInteger,
    key: sharedTypes.strAlphanumKey,
});

const initClientSchema = Joi.object({
    id: sharedTypes.id,
    players: playersSchema,
    coin: collectibleSchema
})

const MooveOnServerSchema = Joi.object({
    dir: sharedTypes.validDirection.required(),
    x: sharedTypes.nullableInteger.required(),
    y: sharedTypes.nullableInteger.required()
})

const MooveOnClientSchema = Joi.object({
    id: sharedTypes.id,
    dir: sharedTypes.validDirection.required(),
    x: sharedTypes.nullableInteger.required(),
    y: sharedTypes.nullableInteger.required()
})

const DestroyItemSchema = Joi.object({
    playerId: sharedTypes.id,
    coinValue: sharedTypes.positiveInteger.required(),
    coinId: sharedTypes.id
})

const sizeSchema = Joi.object({
    headerWidth: sharedTypes.positiveInteger,
    headerHeigth: sharedTypes.positiveInteger,
    bodyWidth: sharedTypes.positiveInteger,
    bodyHeight: sharedTypes.positiveInteger,
    playerSize: sharedTypes.positiveInteger,
    coinSize: sharedTypes.positiveInteger,
    playBorder: sharedTypes.positiveInteger,
});

export {
    sharedTypes,
    playerSchema,
    initClientSchema,
    collectibleSchema,
    sizeSchema,
    MooveOnServerSchema,
    MooveOnClientSchema,
    DestroyItemSchema
  }