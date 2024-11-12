// most basic example

function identity<Type>(arg: Type): Type {
  return arg;
}

const val1 = identity(9); // TS knows that the return type is also a number
const val2 = identity('foobar'); // TS know that the return type is also a string

// often the Type is inferred from the input arguments,
// but it is possible to define the function Type manually and override this inference

const val3 = identity<string>(9); // TS now complains that the input isn't of the correct type;

// this comes up often when we use reacts useState hook
// const [state, setState] = useState<boolean>(false)

////////////////////////////////////////////////////////////////////

// narrowing (the second way the extends keyword can be used)

function useFooProp<Type extends { foo: number }>(arg: Type): Type {
  console.log(arg.foo);
  return arg;
}

const val4 = useFooProp('string'); // TS complains because the string type has no prop called "foo"
const val5 = useFooProp({ foo: 9, bar: 'foobar' });

////////////////////////////////////////////////////////////////////

// defining types using other types

type HasFooType<T> = {
  foo: T;
};

function extractFoo<T>(arg: HasFooType<T>): T {
  return arg.foo;
}

const val6 = extractFoo({ foo: 9 }); // again TS has infered that the return type "T" is a number

// we are familiar with this already from for example the Record type (which takes two type arguments):

type LowercaseUnion = 'a' | 'b' | 'c';

type UppercaseMapping = Record<LowercaseUnion, string>;

const uppercaseMapping: UppercaseMapping = {
  a: 'A',
  b: 'B',
  c: 'C',
};

/// bonus: definition of the Record Type:

type MyRecord<Key extends string, Type> = {
  [K in Key]: Type;
};

////////////////////////////////////////////////////////////////////

// conditional types (the third way the extends keyword can be used)

type Classifier = 'fooString' | 'barNumber';

type ClassifierType<T extends Classifier> = T extends 'fooString'
  ? //                                        ^^^^^^^ conditional use of extends
    //                ^^^^^^^ narrowing use of extends
    string
  : number;

type GenericType<T extends Classifier> = {
  classifier: T;
  value: ClassifierType<T>;
};

function extractValue<T extends Classifier>(
  arg: GenericType<T>
): ClassifierType<T> {
  return arg.value;
}

const val7 = extractValue({
  classifier: 'barNumber',
  value: 9,
});
