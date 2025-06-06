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

function extractValue(input: FooOrBarType): FooOrBarType['value'] {
  if (input.classifier === 'fooString') {
    // narrowing
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

// define the value AND the classifier using the same type variable, so that they are always in sync
// this will allow us to more tightly define the return type of the function based on the input type

type Classifier = 'fooString' | 'barNumber';

type ClassifierValue<T extends Classifier> = T extends 'fooString'
  ? //                                        ^^^^^^^ conditional use of extends
    //                ^^^^^^^ narrowing use of extends
    string
  : number;

type DiscriminatedUnion<T extends Classifier> = {
  classifier: T;
  value: ClassifierValue<T>;
};

/////////////////////// Attempt 1 //////////////////////////////////////////////////////////////////////////////////////

function genericFunction1<T extends Classifier>(
  input: DiscriminatedUnion<T> // DiscriminatedUnion<'fooString' | 'barNumber'>
): ClassifierValue<T> {
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

// essentially the same as the example from the TS docs using our new types

function genericFunction2(
  input: DiscriminatedUnion<'fooString'> | DiscriminatedUnion<'barNumber'>
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
// and we type that record using a mapped type
//
// but this is actually more type safe.
// if we add a new classifier, we will have to add a new branch to the branches object,
// and TS will complain if we don't handle it, so we can't forget to handle it
//
// there is also a new TS concept here: the 'in' operator
// we are using it to iterate over the keys of the Classifier type and using that 'CT' key to specify
// the type of the input and output parameters for each branch function

function genericFunction3<T extends Classifier>(
  input: DiscriminatedUnion<T>
): ClassifierValue<T> {
  const branches: {
    [CT in Classifier]: (input: DiscriminatedUnion<CT>) => ClassifierValue<CT>;
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

const numberOfInchesInFoot = 12;
const numberOfCentimetersInMeter = 100;
const numberOfCentimetersInInch = 2.54;
const numberOfInchesInCentimeter = 1 / numberOfCentimetersInInch;

// this is fine if there are only two units, but if there are more, we need to use a more flexible approach
type UnitMeasurementUnflexible<U extends Unit> = U extends 'imperial'
  ? { feet: number; inches: number }
  : { cm: number; m: number };

// this is the more flexible approach, but it needs to indexed differently
// UnitMeasurement[Unit] instead of UnitMeasurement<Unit>
// but it doesn't enforce that we have to handle all the units in the Unit type
type UnitMeasurementUnsafe = {
  imperial: { feet: number; inches: number };
  metric: { cm: number; m: number };
};

// we can improve it a little further by using reintroducing the type variable 'U'
// this way we can ensure that the UnitMeasurement type is always in sync with the Unit type
// and we need to handle all the units in the Unit type, otherwise TS will complain
type UnitMeasurement<U extends Unit> = {
  imperial: { feet: number; inches: number };
  metric: { cm: number; m: number };
}[U];
//^^ <--- notice we are using the Unit type variable here to index into the UnitMeasurement type

type Height<U extends Unit> = {
  unit: U;
  measurement: UnitMeasurement<U>;
};

function multiplyHeight<U extends Unit>(
  height: Height<U>,
  multiple: number
): Height<U> {
  const branches: {
    [U in Unit]: (height: Height<U>, multiple: number) => Height<U>;
  } = {
    imperial: (height, multiple) => {
      const { majorUnitAmount, minorUnitAmount } = multiplyCompoundUnit(
        {
          majorUnitAmount: height.measurement.feet,
          minorUnitAmount: height.measurement.inches,
          majorMinorRatio: numberOfInchesInFoot,
        },
        multiple
      );
      return {
        unit: height.unit,
        measurement: {
          feet: majorUnitAmount,
          inches: minorUnitAmount,
        },
      };
    },
    metric: (height, multiple) => {
      const { majorUnitAmount, minorUnitAmount } = multiplyCompoundUnit(
        {
          majorUnitAmount: height.measurement.m,
          minorUnitAmount: height.measurement.cm,
          majorMinorRatio: numberOfCentimetersInMeter,
        },
        multiple
      );
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

/////////////////////// Looking back ////////////////////////////////////////////////////////////////////////////////

// comparing with using a simpler union type for measurement like we had in the very first example from the TS docs:
// we can use a simpler IF syntax but the type safety is not as good

type Imperial = {
  classifier: 'imperial';
  feet: number;
  inches: number;
};

type Metric = {
  classifier: 'metric';
  meters: number;
  centimeters: number;
};

type Measurement = Imperial | Metric;

function mulitplyMeasurement(
  measurement: Measurement,
  multiple: number
): Measurement {
  if (measurement.classifier === 'imperial') {
    const multple = multiplyCompoundUnit(
      {
        majorUnitAmount: measurement.feet,
        minorUnitAmount: measurement.inches,
        majorMinorRatio: numberOfInchesInFoot,
      },
      multiple
    );
    return {
      classifier: 'imperial',
      feet: multple.majorUnitAmount,
      inches: multple.minorUnitAmount,
    };
  } else {
    const multple = multiplyCompoundUnit(
      {
        majorUnitAmount: measurement.meters,
        minorUnitAmount: measurement.centimeters,
        majorMinorRatio: numberOfCentimetersInMeter,
      },
      multiple
    );
    // there is poor type safety here, because TS doesn't know that the return type is different based on the classifier value
    // this is wrong, it should be 'metric' not 'imperial'
    return {
      classifier: 'imperial',
      feet: multple.majorUnitAmount,
      inches: multple.minorUnitAmount,
    };
  }
}

/////////////////////// exercise ///////////////////////////////////////////////////////////////////////////////////////
/////////////////////// convert height /////////////////////////////////////////////////////////////////////////////////

function convertHeight<U extends Unit>(height: Height<U>): Height<U> {
  const branches: {
    [U in Unit]: (height: Height<U>) => Height<U>;
  } = {
    imperial: (height) => {
      const convertedAmount = convertCompoundUnit(
        {
          majorUnitAmount: height.measurement.feet,
          minorUnitAmount: height.measurement.inches,
          majorMinorRatio: numberOfInchesInFoot,
        },
        numberOfCentimetersInMeter,
        numberOfInchesInCentimeter
      );
      return {
        unit: 'metric',
        measurement: {
          m: convertedAmount.majorUnitAmount,
          cm: convertedAmount.minorUnitAmount,
        },
      };
    },
    metric: (height) => {
      const convertedAmount = convertCompoundUnit(
        {
          majorUnitAmount: height.measurement.m,
          minorUnitAmount: height.measurement.cm,
          majorMinorRatio: numberOfCentimetersInMeter,
        },
        numberOfInchesInFoot,
        numberOfCentimetersInInch
      );
      return {
        unit: 'imperial',
        measurement: {
          feet: convertedAmount.majorUnitAmount,
          inches: convertedAmount.minorUnitAmount,
        },
      };
    },
  };
  return branches[height.unit](height);
}

////// helper functions ///////////////////////////////////////////////////////////////////////////////////////

type CompoundMeasurement = {
  majorUnitAmount: number;
  minorUnitAmount: number;
  majorMinorRatio: number;
};

function convertAmountToMinorUnit(amount: CompoundMeasurement): number {
  return (
    amount.majorUnitAmount * amount.majorMinorRatio + amount.minorUnitAmount
  );
}

function convertMinorUnitToAmount(
  minorUnitAmount: number,
  majorMinorRatio: number
): CompoundMeasurement {
  return {
    majorUnitAmount: Math.floor(minorUnitAmount / majorMinorRatio),
    minorUnitAmount: minorUnitAmount % majorMinorRatio,
    majorMinorRatio,
  };
}

function multiplyCompoundUnit(
  amount: CompoundMeasurement,
  multiple: number
): CompoundMeasurement {
  const startingAmountInMinorUnit = convertAmountToMinorUnit(amount);
  const finalAmountInMinorUnit = startingAmountInMinorUnit * multiple;
  return convertMinorUnitToAmount(
    finalAmountInMinorUnit,
    amount.majorMinorRatio
  );
}

function convertCompoundUnit(
  amount: CompoundMeasurement,
  outputMajorMinorRatio: number,
  conversionRatioMinorUnit: number
): CompoundMeasurement {
  const startingAmountInMinorUnit = convertAmountToMinorUnit(amount);
  const finalAmountInMinorUnit =
    startingAmountInMinorUnit * conversionRatioMinorUnit;
  return convertMinorUnitToAmount(
    finalAmountInMinorUnit,
    outputMajorMinorRatio
  );
}
