export function normalizeHobbies(hobbies) {
  return (hobbies || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function calculateCompatibility(userProfile, candidate) {
  let score = 0;

  const userCleanliness = userProfile?.cleanliness || "";
  const candCleanliness = candidate?.cleanliness || "";
  if (userCleanliness === candCleanliness && userCleanliness) {
    score += 40;
  } else if (
    userCleanliness === "Moderately clean" ||
    candCleanliness === "Moderately clean"
  ) {
    score += 20;
  }

  const userSleep = userProfile?.sleepSchedule || "";
  const candSleep = candidate?.sleepSchedule || "";
  if (userSleep === candSleep && userSleep) {
    score += 35;
  } else if (userSleep === "Balanced" || candSleep === "Balanced") {
    score += 20;
  }

  const userHobbies = normalizeHobbies(userProfile?.hobbies);
  const candHobbies = normalizeHobbies(candidate?.hobbies);
  const commonHobbies = candHobbies.filter((hobby) =>
    userHobbies.includes(hobby.toLowerCase())
  );
  score += Math.min(commonHobbies.length * 15, 25);

  return {
    score: Math.min(score, 100),
    commonHobbies,
  };
}