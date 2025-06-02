import { ExtentionSatisfiesBase } from './type_utils';

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

type UsefulTypeSatisifies = ExtentionSatisfiesBase<
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

type RestrictedUsefulTypeWithError = ExtentionSatisfiesBase<
  RestrictedBaseType,
  {
    mustHaveFoo: boolean;
    mustHaveBar: number;
    anotherProp: WeirdClass;
  }
>;

type RestrictedUsefulTypeOK = ExtentionSatisfiesBase<
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
// it isnt only aware of the RestrictedBaseType type, but also any extra properties that are added
acceptableObjectInstance.stringProp = 9;