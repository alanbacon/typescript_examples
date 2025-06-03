/////////////////////// Example from docs ///////////////////////////////////////////////////////////////////////////////

type FooString = {
  classifier: 'fooString';
  value: string;
};
type BarNumber = {
  classifier: 'barNumber';
  value: number;
};
type FooOrBarType = FooString | BarNumber;

function extractValue(input: FooOrBarType): string | number {
  if (input.classifier === 'fooString') { // narrowing
    return input.value[0]; // TS knows value is a string
  } else {
    return input.value + 1; // TS knows value is a number
  }
}

// val0 could be a string or a number (because return type of function isn't tied to the input type),
// but we want it to definitely be a string, because the input.classifier is 'fooString'
const val0 = extractValue({
  classifier: 'fooString',
  value: 'foo',
});

/////////////////////// Tighten everything up //////////////////////////////////////////////////////////////////////////

type Classifier = 'fooString' | 'barNumber';

type ClassifierType<T extends Classifier> = T extends 'fooString' // conditional use of extends
  ? string
  : number;

type GenericType<T extends Classifier> = {
  classifier: T;
  value: ClassifierType<T>;
};

/////////////////////// Attempt 1 //////////////////////////////////////////////////////////////////////////////////////

function genericFunction1<T extends Classifier>(
  input: GenericType<T> // GenericType<'fooString' | 'barNumber'>
): ClassifierType<T> {
  // TS is not able to infer the type input.value based on the input.classifier variable :(
  if (input.classifier === 'fooString') {
    return input.value[0];
  } else {
    return input.value + 1;
  }
}

// intelisense knows that the type of val1 is a string, based on the classifier value!
const val1 = genericFunction1({ classifier: 'fooString', value: 'foo' });

/////////////////////// Attempt 2 //////////////////////////////////////////////////////////////////////////////////////

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

/////////////////////// Attempt 3 //////////////////////////////////////////////////////////////////////////////////////

// we have to change our if statement logic into a Record of functions instead :(

type ClassifierTypeMap = {
  [K in Classifier]: GenericType<K>['value'];
};

// the above is a more concise way to write the same thing as below
// type ClassifierTypeMap = {
//   fooString: string;
//   barNumber: number;
// };

function genericFunction3<T extends Classifier>(
  input: GenericType<T> // GenericType<'fooString'> | GenericType<'barNumber'>
): ClassifierTypeMap[T] {
  
  const branches: {
    [CT in Classifier]: (input: GenericType<CT>) => ClassifierTypeMap[CT];
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

type Unit = 'imperial' | 'metric';

// this is fine if there are only two units, but if there are more, we need to use a more flexible approach
// type UnitMeasurement<U extends Unit> = U extends 'imperial'
//   ? { feet: number; inches: number }
//   : { cm: number; m: number };

// this is a more flexible approach, but it needs to indexed differently
// UnitMeasurement[Unit] instead of UnitMeasurement<Unit>
type UnitMeasurement = {
  imperial: { feet: number; inches: number };
  metric: { cm: number; m: number };
}

type Height<U extends Unit> = {
  unit: U;
  measurement: UnitMeasurement[U];
};

function multiplyHeight<U extends Unit>(
  height: Height<U>,
  multiple: number
): Height<U> {
  const branches: {
    [U in Unit]: (height: Height<U>, multiple: number) => Height<U>;
  } = {
    imperial: (height, multiple) => {
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
    metric: (height, multiple) => {
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
  { unit: 'metric', measurement: { m: 2, cm: 60 } },
  2
);
// 5.20m
console.log(
  `${multipledMeters.measurement.m}.${multipledMeters.measurement.cm}m`
);

const multipledFeet = multiplyHeight(
  { unit: 'imperial', measurement: { feet: 3, inches: 5 } },
  3
);
// 10'3"
console.log(
  `${multipledFeet.measurement.feet}'${multipledFeet.measurement.inches}"`
);

// comparing with using a simpler union type for measurement like we had in the very first example from the TS docs:
// we can use a simpler IF syntax but the type safety is not as good

type Imperial = {
  classifier: 'imperial';
  feet: number;
  inches: number;
}
 
type Metric = {
  classifier: "metric";
  meters: number;
  centimeters: number;
}
 
type Measurement = Imperial | Metric;

function mulitplyMeasurement(
  measurement: Measurement,
  multiplier: number
): Measurement {
  if (measurement.classifier === 'imperial') {
    const multple = multiplyCompoundUnit({
      startingAmount: {
        majorUnitAmount: measurement.feet,
        minorUnitAmount: measurement.inches},
      majorMinorRatio: 12,
      multiple: multiplier,
    });
    return {classifier: 'imperial', feet: multple.majorUnitAmount, inches: multple.minorUnitAmount};
  } else {
    const multple = multiplyCompoundUnit({
      startingAmount: {
        majorUnitAmount: measurement.meters,
        minorUnitAmount: measurement.centimeters},
      majorMinorRatio: 1000,
      multiple: multiplier,
    });
    // there is poor type safety here, because TS doesn't know that the return type is different based on the classifier value
    // this is wrong, it should be 'metric' not 'imperial'
    return {classifier: 'imperial', feet: multple.majorUnitAmount, inches: multple.minorUnitAmount}; 
  }
}