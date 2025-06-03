type Fish = {
  swimSpeed: number;
}

type Bird = {
  flightSpeed: number;
}

function getRandomPet(): Fish | Bird {
  return Math.random() > 0.5 ? {swimSpeed: 10} : {flightSpeed: 20};
}

const arrayOfPets: (Fish | Bird)[] = Array.from({ length: 10 }, () => getRandomPet());

const arrayOfJustFishButWithBrokenType = arrayOfPets.filter(
  (pet): boolean => {
    return (pet as Fish).swimSpeed !== undefined;
  }
) as Fish[]; // need to cast to Fish[] because the type will not be correctly inferred


///// or //////

const arrayOfJustFish = arrayOfPets.filter(
  // instead of using a boolean return type, we can use a type predicate to safely narrow the type
  (pet): pet is Fish => {
    return (pet as Fish).swimSpeed !== undefined;
  }
);