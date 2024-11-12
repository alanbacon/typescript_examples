type Classifier = 'fooString' | 'barNumber';

type ClassifierType<T extends Classifier> = T extends 'fooString'
  ? string
  : number;

type GenericType<T extends Classifier> = {
  classifier: T;
  value: ClassifierType<T>;
};

function genericFunction1<T extends Classifier>(
  input: GenericType<T> // GenericType<'fooString' | 'barNumber'>
): ClassifierType<T> {
  if (input.classifier === 'fooString') {
    return input.value[0];
  } else {
    return input.value + 1;
  }
}

const val1 = genericFunction1({ classifier: 'fooString', value: 'foo' });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function genericFunction2(
  input: GenericType<'fooString'> | GenericType<'barNumber'>
): string | number {
  if (input.classifier === 'fooString') {
    return input.value[0];
  } else {
    return input.value + 1;
  }
}

// but intelisense now thinks (and TS allows) val2 to be string | number, whereas we want to narrow it to just string
const val2 = genericFunction2({ classifier: 'fooString', value: 'foo' });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

type ClassifierTypeMap = {
  [K in Classifier]: GenericType<K>['value'];
};

// type ClassifierTypeMap = {
//   fooString: string;
//   barNumber: number;
// };

type GenericTypeUnion<T extends Classifier> = {
  [K in T]: GenericType<K>;
}[T];

function genericFunction3<T extends Classifier>(
  input: GenericTypeUnion<T> // GenericType<'fooString'> | GenericType<'barNumber'>
): ClassifierTypeMap[T] {
  // we also have to change our if statement logic into a Record of functions instead :(
  const branches: {
    [CT in Classifier]: (input: GenericTypeUnion<CT>) => ClassifierTypeMap[CT];
  } = {
    fooString: (input) => {
      return input.value[0]; // TS knows value is a string and return must be a string
    },
    barNumber: (input) => {
      return input.value + 1; // TS knows value is a number and return must be a number
    },
  };
  return branches[input.classifier](input);
}

const val3 = genericFunction3({
  classifier: 'fooString',
  value: 'foo',
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// more real world example

type Unit = 'feetInches' | 'meters';

type UnitMeasurement<U extends Unit> = U extends 'feetInches'
  ? { feet: number; inches: number }
  : { cm: number; m: number };

type Height<U extends Unit> = {
  unit: U;
  measurement: UnitMeasurement<U>;
};

type HeightUnion<U extends Unit> = {
  [K in U]: Height<K>;
}[U];

function multiplyHeight<U extends Unit>(
  height: HeightUnion<U>,
  multiple: number
): HeightUnion<U> {
  const branches: {
    [U in Unit]: (height: HeightUnion<U>, multiple: number) => HeightUnion<U>;
  } = {
    feetInches: (height, multiple) => {
      const { majorUnitAmount, minorUnitAmount } = multiplyCompoundUnit({
        startingAmount: {
          majorUnitAmount: height.measurement.feet,
          minorUnitAmount: height.measurement.inches,
        },
        majorMinorRatio: 12,
        multiple,
      });
      return {
        unit: height.unit,
        measurement: {
          feet: majorUnitAmount,
          inches: minorUnitAmount,
        },
      };
    },
    meters: (height, multiple) => {
      const { majorUnitAmount, minorUnitAmount } = multiplyCompoundUnit({
        startingAmount: {
          majorUnitAmount: height.measurement.m,
          minorUnitAmount: height.measurement.cm,
        },
        majorMinorRatio: 100,
        multiple,
      });
      return {
        unit: height.unit,
        measurement: {
          m: majorUnitAmount,
          cm: minorUnitAmount,
        },
      };
    },
  };
  return branches[height.unit](height, multiple);
}

function multiplyCompoundUnit(args: {
  startingAmount: {
    majorUnitAmount: number;
    minorUnitAmount: number;
  };
  majorMinorRatio: number;
  multiple: number;
}): { majorUnitAmount: number; minorUnitAmount: number } {
  const startingAmountInMinorUnit =
    args.startingAmount.majorUnitAmount * args.majorMinorRatio +
    args.startingAmount.minorUnitAmount;
  const finalAmountInMinorUnit = startingAmountInMinorUnit * args.multiple;
  return {
    majorUnitAmount: Math.floor(finalAmountInMinorUnit / args.majorMinorRatio),
    minorUnitAmount: finalAmountInMinorUnit % args.majorMinorRatio,
  };
}

const multipledMeters = multiplyHeight(
  { unit: 'meters', measurement: { m: 2, cm: 60 } },
  2
);
// 5.20m
console.log(
  `${multipledMeters.measurement.m}.${multipledMeters.measurement.cm}m`
);

const multipledFeet = multiplyHeight(
  { unit: 'feetInches', measurement: { feet: 3, inches: 5 } },
  3
);
// 10'3"
console.log(
  `${multipledFeet.measurement.feet}'${multipledFeet.measurement.inches}"`
);
