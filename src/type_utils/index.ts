// https://stackoverflow.com/questions/75367028/can-i-map-a-string-literal-to-a-type-of-types/75369019#75369019
export type ExtentionSatisfiesBase<U, T extends U> = T;

export type MapFromLiteral<
  Literal extends string | symbol,
  TypeToMapTo,
  MappedType extends {
    [key in Literal]: TypeToMapTo;
  },
> = MappedType;
