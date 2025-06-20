import { Satisfies } from './type_utils';

// make a weird type to use in examples
class WeirdClass {
  self: WeirdClass;
  _innerWorkings: Array<boolean>;

  constructor() {
    this.self = this;
    this._innerWorkings = [true, false];
  }
}

////

type BaseType = {
  mustHaveFoo: boolean;
  mustHaveBar: number;
};

type UsefulTypeSatisifies = Satisfies<
  BaseType,
  {
    mustHaveFoo: boolean;
    mustHaveBar: number;
    anotherProp: WeirdClass;
  }
>;

// similar to writing:
type UsefulTypeExtends = BaseType & { anotherProp: WeirdClass };

// or
// (this is first way the extends keyword can be used):
interface UsefulInterface extends BaseType {
  anotherProp: WeirdClass;
}

// but what if we wanted to restrict what type anotherProp can be
// for example if this is an type that needs to be serialisable for http JSON transport or
// conversion into a database

type AllowedDbType = string | number | boolean;
interface RestrictedBaseType extends Record<string, AllowedDbType> {
  mustHaveFoo: boolean;
  mustHaveBar: number;
}

// then the Satisfies type can be used to ensure that only AllowedDbTypes exist on the type

type RestrictedUsefulTypeWithError = Satisfies<
  RestrictedBaseType,
  {
    mustHaveFoo: boolean;
    mustHaveBar: number;
    anotherProp: WeirdClass;
  }
>;

type RestrictedUsefulTypeOK = Satisfies<
  RestrictedBaseType,
  {
    mustHaveFoo: boolean;
    mustHaveBar: number;
    anotherProp: string;
  }
>;

// if you want to work directly with objects instead of types, you can use the `satisfies` operator

const unacceptableObjectInstance = {
  mustHaveFoo: false,
  mustHaveBar: 3,
  anotherProp: new WeirdClass(),
} satisfies RestrictedBaseType;

const acceptableObjectInstance = {
  mustHaveFoo: false,
  mustHaveBar: 3,
  stringProp: 's',
} satisfies RestrictedBaseType;

// intellisense knows stringProp is now a string
// it isnt only aware of the RestrictedBaseType type, but also the type of any extra properties that are added
acceptableObjectInstance.stringProp = 9;

// we don't get this level of intellisense without the `satisfies` operator
const unawareObjectInstance: RestrictedBaseType = {
  mustHaveFoo: false,
  mustHaveBar: 3,
  stringProp: 's',
};

unawareObjectInstance.stringProp = 9;

// In summary:
//
// the Satisfies type helper is a safe way to extend a base type
// while ensuring that the extended type adheres to the constraints of the base type.
//
// the satisfies operator is a safe way to extend an object from a base type
// while ensuring that the extended object adheres to the constraints of the base type.
//
// much better than using the 'as' keyword.
//
// there is a slightly different use case for the `satisfies` operator here:
// https://www.reddit.com/r/webdev/comments/zrt1rb/the_satisfies_operator_in_typescript_49_is_a_game/
