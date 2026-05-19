import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { analyze } from "../src/services/analyzer.js";
import { generateRoast } from "../src/services/roastEngine.js";

const prisma = new PrismaClient();

// 50 sample passwords spanning the severity spectrum. These are public-record
// well-known weak passwords + some realistic-looking mid/strong examples for the
// hall of shame demo. NOTHING here is a real user secret.
const SAMPLES: { password: string; nickname: string }[] = [
  { password: "123456", nickname: "rookie" },
  { password: "password", nickname: "literal_pw" },
  { password: "qwerty", nickname: "walkman" },
  { password: "letmein", nickname: "knock_knock" },
  { password: "admin", nickname: "default_andy" },
  { password: "hunter2", nickname: "y2k_lurker" },
  { password: "iloveyou", nickname: "romantic" },
  { password: "monkey", nickname: "ape_escape" },
  { password: "abc123", nickname: "starter_pack" },
  { password: "welcome", nickname: "welcome_mat" },
  { password: "111111", nickname: "one_note" },
  { password: "12345678", nickname: "the_eight" },
  { password: "dragon", nickname: "dragon_rider" },
  { password: "sunshine", nickname: "optimist" },
  { password: "princess", nickname: "royalty" },
  { password: "football", nickname: "go_team" },
  { password: "summer", nickname: "season_pass" },
  { password: "michael", nickname: "named_one" },
  { password: "jennifer", nickname: "named_two" },
  { password: "starwars", nickname: "saga_fan" },
  { password: "asdfgh", nickname: "left_hand" },
  { password: "qazwsx", nickname: "diagonal_dan" },
  { password: "pokemon", nickname: "gotta_catch" },
  { password: "shadow", nickname: "edgelord" },
  { password: "trustno1", nickname: "xfiles" },
  { password: "matrix1999", nickname: "neo_fan" },
  { password: "Spring2020!", nickname: "post_lockdown" },
  { password: "Winter2024!", nickname: "still_doing_it" },
  { password: "Companyname1", nickname: "corp_classic" },
  { password: "Password123!", nickname: "minimum_viable" },
  { password: "Summer2021", nickname: "season_seasoned" },
  { password: "Pa$$w0rd!", nickname: "leet_skid" },
  { password: "Football#22", nickname: "team_spirit" },
  { password: "Hello_World1", nickname: "first_program" },
  { password: "BlueOcean42", nickname: "deep_diver" },
  { password: "Sunny-Day#2023", nickname: "weather_app" },
  { password: "Tr0ub4dor&3", nickname: "xkcd_aware" },
  { password: "Cor!rect7Horse9Battery", nickname: "xkcd_adept" },
  { password: "MyDog$Name!sRex", nickname: "pet_parent" },
  { password: "GoldenRetriever#47", nickname: "good_boy" },
  { password: "Cappuccino@Sunrise!", nickname: "barista_brain" },
  { password: "OctopusBalloonRiver42!", nickname: "ai_diceware" },
  { password: "Mountain$Goat&Cliff#88", nickname: "alpine_acolyte" },
  { password: "correct horse battery staple", nickname: "the_meme" },
  { password: "qK9!vP2#mN8$xR4&", nickname: "manager_user" },
  { password: "z@4pL!9qX#7nM&3vY!8tQ#5", nickname: "true_believer" },
  { password: "Hk7$mZqL2pX!nY9wR&8cV#4t", nickname: "vault_dweller" },
  { password: "9aB!2cD@3eF#4gH$5iJ%6kL^7mN&8oP*9qR(0sT)1uV", nickname: "absurd_andy" },
  { password: "FortressMode!Engaged~With~24~Chars#OfChaos!", nickname: "fortress_fan" },
  { password: "Q!w@E#r$T%y^U&i*O(P)A!s@D#f$G%h^J&k*L(zX)cV!bN@m#", nickname: "overkill_oscar" },
];

async function main() {
  // Clear existing seed data first for idempotency.
  await prisma.roast.deleteMany({});
  for (const sample of SAMPLES) {
    const analysis = analyze(sample.password);
    const roastText = generateRoast(sample.password, analysis);
    await prisma.roast.create({
      data: {
        id: nanoid(),
        ownerToken: nanoid(32),
        length: analysis.length,
        entropy: analysis.entropy,
        score: analysis.score,
        crackTimeSeconds: analysis.crackTimeSeconds,
        crackTimeDisplay: analysis.crackTimeDisplay,
        charClasses: JSON.stringify(analysis.charClasses),
        topPattern: analysis.topPattern,
        severity: analysis.severity,
        roastText,
        nickname: sample.nickname,
        isPublic: true,
      },
    });
  }
  console.log(`Seeded ${SAMPLES.length} roasts.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
