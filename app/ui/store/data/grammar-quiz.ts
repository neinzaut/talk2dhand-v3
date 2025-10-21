// Grammar quiz items for ASL and FSL 

export interface GrammarQuizItem {
  id: string
  sentence: string
  correctGloss: string
  rationale: string
  language: "asl" | "fsl"
}

// ASL Quiz Items (20 items from QUIZ_CONTENT.md)
const aslQuizItems: GrammarQuizItem[] = [
  {
    id: "asl-quiz-1",
    language: "asl",
    sentence: "Where do you work?",
    correctGloss: "YOU WORK WHERE?",
    rationale:
      "This is a standard WH-question. The subject YOU and verb WORK establish the context, and the WH-sign WHERE is placed at the end. Non-manual signals include furrowed eyebrows over WHERE.",
  },
  {
    id: "asl-quiz-2",
    language: "asl",
    sentence: "My parents are coming to visit next week.",
    correctGloss: "NEXT-WEEK, MY PARENTS COME-HERE VISIT.",
    rationale:
      "This sentence follows the Time-Topic-Comment structure. NEXT-WEEK establishes the time. MY PARENTS is the topic. COME-HERE VISIT is the comment. The sign PARENTS is a compound of MOTHER+FATHER.",
  },
  {
    id: "asl-quiz-3",
    language: "asl",
    sentence: "I don't know his name.",
    correctGloss: "IX-he NAME, ME DON'T-KNOW.",
    rationale:
      "The object, IX-he NAME (his name), is topicalized. The negation is expressed using the single sign DON'T-KNOW, which incorporates negation through reversal of orientation.",
  },
  {
    id: "asl-quiz-4",
    language: "asl",
    sentence: "If I finish my homework, I can go to the movies.",
    correctGloss: "MY HOMEWORK ME FINISH, MOVIE ME CAN GO.",
    rationale:
      "This is a conditional sentence. The 'if' clause, MY HOMEWORK ME FINISH, is the condition/topic. The 'then' clause, MOVIE ME CAN GO, is the consequence. Raised eyebrows must be held over the entire conditional clause.",
  },
  {
    id: "asl-quiz-5",
    language: "asl",
    sentence: "Do you want to eat pizza for dinner?",
    correctGloss: "TONIGHT DINNER PIZZA, YOU WANT EAT?",
    rationale:
      "This is a Yes/No question. The topic TONIGHT DINNER PIZZA is established first for clarity. The question itself is YOU WANT EAT?. The entire sentence must be accompanied by raised eyebrows, widened eyes, and a forward head tilt.",
  },
  {
    id: "asl-quiz-6",
    language: "asl",
    sentence: "The book on the table is mine.",
    correctGloss: "BOOK ON TABLE, IX-'that' MY.",
    rationale:
      "This sentence uses topicalization. The topic is BOOK ON TABLE. IX-'that' points to the established topic, and MY is the comment. Raised eyebrows are used over the topic phrase BOOK ON TABLE.",
  },
  {
    id: "asl-quiz-7",
    language: "asl",
    sentence: "He failed the test because he didn't study.",
    correctGloss: "TEST IX-he FAIL WHY-rhq? STUDY NOT.",
    rationale:
      "This sentence uses a rhetorical question to explain the reason. The topic is established: TEST IX-he FAIL. The rhetorical question WHY-rhq? follows, and is immediately answered: STUDY NOT.",
  },
  {
    id: "asl-quiz-8",
    language: "asl",
    sentence: "What time does the meeting start tomorrow?",
    correctGloss: "TOMORROW, MEETING START WHAT-TIME?",
    rationale:
      "A WH-question following TTC structure. TOMORROW is the time. MEETING is the topic. START WHAT-TIME? is the comment/question. Furrowed eyebrows are used over WHAT-TIME.",
  },
  {
    id: "asl-quiz-9",
    language: "asl",
    sentence: "She can't come to the party.",
    correctGloss: "PARTY, IX-she COME CAN'T.",
    rationale:
      "The topic PARTY is established. The comment is IX-she COME CAN'T. The negative sign CAN'T is placed at the end for emphasis. A negative headshake should accompany CAN'T.",
  },
  {
    id: "asl-quiz-10",
    language: "asl",
    sentence: "I was born in California.",
    correctGloss: "ME BORN WHERE-rhq? fs-C-A-L-I-F-O-R-N-I-A.",
    rationale:
      "This is an effective use of a rhetorical question to introduce information. The signer states ME BORN, asks WHERE-rhq?, and immediately answers by fingerspelling the location.",
  },
  {
    id: "asl-quiz-11",
    language: "asl",
    sentence: "Are your brothers older than you?",
    correctGloss: "YOUR BROTHERS, OLDER THAN YOU?",
    rationale:
      "A Yes/No question. The topic YOUR BROTHERS is established, followed by the question. Raised eyebrows and a forward head tilt must be maintained throughout the entire sentence.",
  },
  {
    id: "asl-quiz-12",
    language: "asl",
    sentence: "The cat is sleeping on the chair.",
    correctGloss: "CHAIR, CAT SLEEP.",
    rationale:
      "This sentence uses O,SV structure. The object/location CHAIR is topicalized to set the scene. The comment CAT SLEEP follows. Raised eyebrows are used over CHAIR.",
  },
  {
    id: "asl-quiz-13",
    language: "asl",
    sentence: "I have never been to France.",
    correctGloss: "FRANCE, ME GO-TO NEVER.",
    rationale:
      "Topic FRANCE is established first. The comment ME GO-TO NEVER contains the negative sign NEVER at the end for emphasis.",
  },
  {
    id: "asl-quiz-14",
    language: "asl",
    sentence: "Why are you learning ASL?",
    correctGloss: "YOU LEARN ASL WHY?",
    rationale:
      "A standard WH-question. The phrase YOU LEARN ASL sets up the context, and the WH-sign WHY is placed at the end. Furrowed eyebrows over WHY.",
  },
  {
    id: "asl-quiz-15",
    language: "asl",
    sentence: "If the store is closed, we will go home.",
    correctGloss: "STORE CLOSE, WE-2 GO-HOME.",
    rationale:
      "A conditional sentence. The 'if' clause is STORE CLOSE. The 'then' clause is WE-2 GO-HOME. Raised eyebrows must be held over STORE CLOSE.",
  },
  {
    id: "asl-quiz-16",
    language: "asl",
    sentence: "My teacher gave me a lot of homework.",
    correctGloss: "HOMEWORK, MY TEACHER GIVE-ME (MUCH).",
    rationale:
      "The object HOMEWORK is topicalized for emphasis. The comment MY TEACHER GIVE-ME follows. The concept of 'a lot' is often shown non-manually or with a sign like MUCH.",
  },
  {
    id: "asl-quiz-17",
    language: "asl",
    sentence: "They will not be at the game on Friday.",
    correctGloss: "FRIDAY, GAME, IX-they NOT BE-THERE.",
    rationale:
      "This follows a Time-Topic-Comment structure. FRIDAY is the time. GAME is the topic. IX-they NOT BE-THERE is the comment, with the negation placed before the verb.",
  },
  {
    id: "asl-quiz-18",
    language: "asl",
    sentence: "Who is that woman with the long, brown hair?",
    correctGloss: "THAT WOMAN, LONG BROWN HAIR, WHO?",
    rationale:
      "A descriptive WH-question. The topic is established first with descriptive elements: THAT WOMAN, LONG BROWN HAIR. The WH-word WHO is placed at the very end.",
  },
  {
    id: "asl-quiz-19",
    language: "asl",
    sentence: "My favorite movie is Star Wars.",
    correctGloss: "MY FAVORITE MOVIE WHAT-rhq? #S-T-A-R W-A-R-S.",
    rationale:
      "A rhetorical question is the most common and natural way to express 'my favorite is...'. The topic MY FAVORITE MOVIE is followed by the rhetorical question WHAT-rhq? and the answer. Note the use of a lexicalized sign for STAR (#S-T-A-R).",
  },
  {
    id: "asl-quiz-20",
    language: "asl",
    sentence: "Do you understand the instructions?",
    correctGloss: "INSTRUCTIONS, YOU UNDERSTAND?",
    rationale:
      "A Yes/No question with topicalization. The topic INSTRUCTIONS is established first, followed by the question YOU UNDERSTAND?. Raised eyebrows and forward head tilt must be held over the entire sentence.",
  },
]

// FSL Quiz Items (20 items from QUIZ_CONTENT.md)
const fslQuizItems: GrammarQuizItem[] = [
  {
    id: "fsl-quiz-1",
    language: "fsl",
    sentence: "What is your favorite color?",
    correctGloss: "YOUR FAVORITE COLOR WHAT?",
    rationale:
      "The topic is YOUR FAVORITE COLOR. The WH-word WHAT is placed at the end. The whq NMS is required.",
  },
  {
    id: "fsl-quiz-2",
    language: "fsl",
    sentence: "I am not tired.",
    correctGloss: "IX-me TIRED.",
    rationale:
      "This is a simple Topic-Comment sentence (IX-me is the topic). The negation is indicated by the n NMS (headshake) over the comment TIRED.",
  },
  {
    id: "fsl-quiz-3",
    language: "fsl",
    sentence: "My brother's name is Ben.",
    correctGloss: "MY BROTHER, NAME fs-B-E-N.",
    rationale:
      "MY BROTHER is the topic. The comment provides the name. Proper nouns like 'Ben' are fingerspelled, indicated by fs-.",
  },
  {
    id: "fsl-quiz-4",
    language: "fsl",
    sentence: "Do you like coffee?",
    correctGloss: "YOU LIKE COFFEE?",
    rationale:
      "This is a yes/no question requiring the q NMS. The structure follows a simple Topic-Comment order.",
  },
  {
    id: "fsl-quiz-5",
    language: "fsl",
    sentence: "We will eat later.",
    correctGloss: "LATER, WE EAT.",
    rationale:
      "The time marker LATER comes first, following the TTC structure. WE is the topic and EAT is the comment.",
  },
  {
    id: "fsl-quiz-6",
    language: "fsl",
    sentence: "Where do you live?",
    correctGloss: "YOU LIVE WHERE?",
    rationale:
      "The topic is YOU. The WH-word WHERE is placed at the end of the question, which requires the whq NMS.",
  },
  {
    id: "fsl-quiz-7",
    language: "fsl",
    sentence: "The house is big and white.",
    correctGloss: "HOUSE, BIG WHITE.",
    rationale:
      "HOUSE is the topic, followed by the descriptive comments (adjectives) BIG and WHITE.",
  },
  {
    id: "fsl-quiz-8",
    language: "fsl",
    sentence: "I need your help.",
    correctGloss: "YOUR HELP, IX-me NEED.",
    rationale:
      "This follows the Object-Subject-Verb (OSV) structure, a common form of topicalization. The object YOUR HELP is the topic, followed by the comment IX-me NEED.",
  },
  {
    id: "fsl-quiz-9",
    language: "fsl",
    sentence: "Why are you sad?",
    correctGloss: "YOU SAD WHY?",
    rationale:
      "The topic is YOU SAD. The WH-word WHY is placed at the end. The entire phrase requires the whq NMS.",
  },
  {
    id: "fsl-quiz-10",
    language: "fsl",
    sentence: "My birthday is in November.",
    correctGloss: "MY BIRTHDAY, #NOV.",
    rationale:
      "MY BIRTHDAY is the topic. The month NOVEMBER is often signed using its lexicalized form, #NOV.",
  },
  {
    id: "fsl-quiz-11",
    language: "fsl",
    sentence: "He is my friend.",
    correctGloss: "IX-he MY FRIEND.",
    rationale:
      "The pronoun 'he' is signed by pointing (IX-he) to a specific person or an established space representing that person. This is a simple Topic-Comment sentence.",
  },
  {
    id: "fsl-quiz-12",
    language: "fsl",
    sentence: "I don't understand.",
    correctGloss: "IX-me UNDERSTAND.",
    rationale:
      "IX-me is the topic. The negation is efficiently conveyed by the n NMS (headshake) over the comment UNDERSTAND.",
  },
  {
    id: "fsl-quiz-13",
    language: "fsl",
    sentence: "Yesterday, I bought a new book.",
    correctGloss: "YESTERDAY, BOOK NEW, IX-me BUY.",
    rationale:
      "The sentence follows the TTC structure. YESTERDAY is the time. The topic is the BOOK, which is described as NEW. The comment is IX-me BUY.",
  },
  {
    id: "fsl-quiz-14",
    language: "fsl",
    sentence: "Is your mother a doctor?",
    correctGloss: "YOUR MOTHER DOCTOR?",
    rationale:
      "A straightforward yes/no question requiring the q NMS over the entire phrase. The structure is Topic-Comment.",
  },
  {
    id: "fsl-quiz-15",
    language: "fsl",
    sentence: "My grandfather is old.",
    correctGloss: "MY GRANDFATHER, OLD.",
    rationale:
      "MY GRANDFATHER is the topic, marked by the t NMS. OLD is the comment.",
  },
  {
    id: "fsl-quiz-16",
    language: "fsl",
    sentence: "How much is this?",
    correctGloss: "IX-this HOW-MUCH?",
    rationale:
      "The topic is the object being pointed at (IX-this). The WH-phrase HOW-MUCH is a compound sign placed at the end. The whq NMS is required.",
  },
  {
    id: "fsl-quiz-17",
    language: "fsl",
    sentence: "I have two sisters.",
    correctGloss: "SISTER, IX-me HAVE TWO.",
    rationale:
      "The topic is SISTER. The comment is IX-me HAVE TWO, specifying the subject and quantity.",
  },
  {
    id: "fsl-quiz-18",
    language: "fsl",
    sentence: "I am learning FSL.",
    correctGloss: "#FSL, IX-me LEARN.",
    rationale:
      "#FSL is the topic. The comment IX-me LEARN describes the action being performed in relation to the topic. #FSL is a lexicalized sign.",
  },
  {
    id: "fsl-quiz-19",
    language: "fsl",
    sentence: "The children are playing outside.",
    correctGloss: "OUTSIDE, CHILDREN PLAY++.",
    rationale:
      "The location OUTSIDE can be established first, similar to a time marker. CHILDREN is the topic. The sign PLAY is repeated (++) to indicate a continuous or ongoing action.",
  },
  {
    id: "fsl-quiz-20",
    language: "fsl",
    sentence: "Please say that again.",
    correctGloss: "AGAIN, PLEASE.",
    rationale:
      "This is a command or request. The core concept is 'again.' The sign PLEASE is added for politeness. The word 'that' is contextual and does not need a separate sign.",
  },
]

export const getQuizItems = (language: "asl" | "fsl"): GrammarQuizItem[] => {
  const quizPool = language === "asl" ? aslQuizItems : fslQuizItems

  // Randomly select 10 items from the pool of 20
  const shuffled = [...quizPool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 10)
}
