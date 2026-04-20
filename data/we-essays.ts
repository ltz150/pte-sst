export type WECategory = 'society' | 'education' | 'environment' | 'technology' | 'economy' | 'health' | 'media';
export type StanceType = 'agree' | 'disagree' | 'partial' | 'both_sides';

export interface WEPoint {
  claim: string;       // Core claim (topic sentence)
  evidence: string[];  // 3 supporting examples
}

export interface WEEssay {
  n: number;
  id: string;         // e.g. WE#5
  title: string;
  question: string;
  cat: WECategory;
  stance: StanceType;
  stanceText: string; // One sentence thesis
  body1: WEPoint;
  body2: WEPoint;
  keywords: string[]; // 4-6 key vocab
}

export const WE_CATEGORY_LABELS: Record<WECategory, string> = {
  society:     '社会 / 文化',
  education:   '教育',
  environment: '环境 / 气候',
  technology:  '科技',
  economy:     '经济 / 商业',
  health:      '健康 / 医疗',
  media:       '媒体 / 传播',
};

export const WE_CATEGORY_COLORS: Record<WECategory, string> = {
  society:     '#185FA5',
  education:   '#3B6D11',
  environment: '#0F6E56',
  technology:  '#533049',
  economy:     '#854F0B',
  health:      '#7B2D2D',
  media:       '#4A4A9A',
};

export const WE_CATEGORY_BG: Record<WECategory, string> = {
  society:     '#E6F1FB',
  education:   '#EAF3DE',
  environment: '#E1F5EE',
  technology:  '#F5EDF8',
  economy:     '#FAEEDA',
  health:      '#FDEAEA',
  media:       '#EEEEFF',
};

export const WE_STANCE_LABELS: Record<StanceType, string> = {
  agree:      '赞成',
  disagree:   '反对',
  partial:    '部分同意',
  both_sides: '两面分析',
};

export const weEssays: WEEssay[] = [
  {
    n: 1, id: 'WE#5', title: 'Transportation Networks', cat: 'environment', stance: 'agree',
    question: 'Governments should create better public transport networks rather than building more roads.',
    stanceText: 'I strongly agree that governments should focus on improving public transport networks for everyone.',
    keywords: ['public transport', 'sustainability', 'traffic congestion', 'urban development', 'bike-sharing'],
    body1: {
      claim: 'A better public transport network is fairer and more efficient, serving all citizens including those without cars.',
      evidence: [
        'Efficient buses and subways enable everyone, including students and the elderly, to move around the city affordably.',
        'Building more roads mainly benefits the vehicle-owning population, while better train networks help reduce traffic for all.',
        'Governments investing in public transport like bike-sharing make cities healthier and more accessible to everyone.',
      ],
    },
    body2: {
      claim: 'Expanding public transport instead of more roads directly tackles pollution and supports long-term urban sustainability.',
      evidence: [
        'More buses and trains mean fewer cars on the road, which lowers air pollution and makes the city cleaner for everyone.',
        'Governments choosing subways over roads save space, reduce noise, and create a better living environment as the city expands.',
        'Reliable light rail systems encourage people to leave their cars at home, cutting emissions and making cities more sustainable.',
      ],
    },
  },
  {
    n: 2, id: 'WE#9', title: 'Global Issue (Climate Change)', cat: 'environment', stance: 'agree',
    question: 'Who has the main responsibility to solve climate change — governments, large companies, or individuals?',
    stanceText: 'Governments should take the lead in solving climate change.',
    keywords: ['legislation', 'green infrastructure', 'carbon emissions', 'clean energy', 'fossil fuels'],
    body1: {
      claim: 'Only governments can create and enforce laws that protect the environment for everyone.',
      evidence: [
        'They can make strict pollution laws for large companies and punish those who break them.',
        'Governments can use taxes to support clean energy and make fossil fuels more expensive.',
        'They can set national recycling rules that all individuals and businesses must follow.',
      ],
    },
    body2: {
      claim: 'Governments have the money and power to build the green infrastructure we need.',
      evidence: [
        'They can pay for and build public transport, helping many people drive less.',
        'Only governments can protect large forests and natural parks from being destroyed.',
        'They can invest in new green technology research that is too expensive for most companies.',
      ],
    },
  },
  {
    n: 3, id: 'WE#10', title: 'Communication', cat: 'media', stance: 'both_sides',
    question: 'Communication has changed significantly in the last 10 years. Discuss the positive and negative impacts.',
    stanceText: 'Communication changes have brought both great connectivity and new challenges.',
    keywords: ['global connectivity', 'misinformation', 'social media', 'face-to-face interaction', 'instant information'],
    body1: {
      claim: 'The positive impact is unprecedented global connectivity and access to instant information.',
      evidence: [
        'We can now have video calls with family abroad for free, making the world feel much smaller.',
        'Social media platforms allow us to share news and ideas with friends across the globe instantly.',
        'Learning new skills is easier because we can find online tutorials and educational content anytime.',
      ],
    },
    body2: {
      claim: 'The negative impact includes the spread of misinformation and a decline in face-to-face interaction skills.',
      evidence: [
        'Fake news can spread rapidly online, confusing people and causing unnecessary panic.',
        'People, especially teenagers, now spend less time talking in person, which may harm their social skills.',
        'The pressure to always be available on messaging apps can lead to stress and a poor work-life balance.',
      ],
    },
  },
  {
    n: 4, id: 'WE#17', title: 'Formal Written Examination', cat: 'education', stance: 'partial',
    question: 'Formal written examinations are a valid method for assessing students. To what extent do you agree?',
    stanceText: 'Formal written exams are a useful but incomplete method for assessing true student learning.',
    keywords: ['assessment', 'academic discipline', 'time management', 'practical skills', 'teamwork'],
    body1: {
      claim: 'Formal written exams can effectively test a student\'s basic knowledge and exam skills under pressure.',
      evidence: [
        'These exams clearly show how well a student remembers key facts and ideas from class.',
        'They test a student\'s ability to write and organize their thoughts quickly and clearly.',
        'Doing well in these exams requires good time management during the test itself.',
      ],
    },
    body2: {
      claim: 'However, formal written exams often fail to measure many other important skills for real life.',
      evidence: [
        'A written exam cannot show a student\'s ability to work well in a team on a project.',
        'It does not test practical skills like public speaking or creative problem-solving.',
        'Some smart students get very nervous and cannot show their real knowledge in exams.',
      ],
    },
  },
  {
    n: 5, id: 'WE#24', title: 'Information Revolution', cat: 'media', stance: 'both_sides',
    question: 'The information revolution has both positive and negative consequences for individuals and society. To what extent do you agree?',
    stanceText: 'The information revolution brings both positive and negative consequences for individuals and society.',
    keywords: ['empowerment', 'misinformation', 'mental well-being', 'mass communications', 'information overload'],
    body1: {
      claim: 'The positive consequences are immense — it provides instant access to information and connects society.',
      evidence: [
        'The information revolution allows individuals to instantly find news and learn skills online, empowering their daily lives.',
        'Social media platforms connect friends and family globally, strengthening the bonds within society.',
        'During emergencies, modern mass communications can quickly spread vital alerts, protecting public safety.',
      ],
    },
    body2: {
      claim: 'However, the negative consequences are serious — including misinformation spread and harm to mental well-being.',
      evidence: [
        'The speed of the information revolution helps false news spread online, misleading individuals and dividing society.',
        'Constant online exposure from modern communications can increase anxiety and loneliness for many individuals.',
        'The overload of information makes it hard for individuals to focus — a clear negative consequence of this digital age.',
      ],
    },
  },
  {
    n: 6, id: 'WE#30', title: 'Shopping Malls', cat: 'economy', stance: 'disagree',
    question: 'Large shopping malls are replacing small local shops. Is this a positive development?',
    stanceText: 'The replacement of small local shops by large shopping malls is largely a negative development.',
    keywords: ['local economy', 'community identity', 'chain stores', 'social cohesion', 'accessibility'],
    body1: {
      claim: 'This trend harms the local economy and reduces the unique character of our towns and cities.',
      evidence: [
        'Small local shops are often run by families, and their closure means local money leaves the community.',
        'When identical chain stores in malls replace unique local shops, every town starts to look the same.',
        'Local bakeries or craftsmen offer special products you cannot find in a standard large shopping mall.',
      ],
    },
    body2: {
      claim: 'It makes daily life less convenient and damages the social connections that hold a community together.',
      evidence: [
        'For elderly people, a nearby local shop is much easier to reach than a distant, crowded mall.',
        'People often chat with their neighbors at the small shop, which is rare in an impersonal shopping mall.',
        'Large malls are usually built outside town centers, increasing car use and traffic for simple shopping trips.',
      ],
    },
  },
  {
    n: 7, id: 'WE#35', title: 'Mass Media', cat: 'media', stance: 'agree',
    question: 'Mass media plays a pivotal role in shaping the opinions of people, especially teenagers. To what extent do you agree?',
    stanceText: 'Mass media like TV and newspapers have a significant influence on people, especially the younger generation.',
    keywords: ['public opinion', 'social norms', 'role models', 'news reports', 'lifestyle trends'],
    body1: {
      claim: 'Mass media provides the main information source that directly shapes the opinions of teenagers.',
      evidence: [
        'News reports on TV about global events form the basic opinions that many young people hold about the world.',
        'Popular talk shows often discuss social issues, which can easily change the way teenagers think about these topics.',
        'Newspaper editorials present strong viewpoints that can guide young people in forming their own initial opinions.',
      ],
    },
    body2: {
      claim: 'Beyond information, mass media influences younger generations by setting trends and defining social norms.',
      evidence: [
        'TV shows and commercials constantly show new fashion and lifestyle trends that teenagers eagerly follow.',
        'Stories in newspapers about successful young role models motivate many in the younger generation to work hard.',
        'The values and behavior praised in popular TV dramas subtly teach young people what society considers acceptable.',
      ],
    },
  },
  {
    n: 8, id: 'WE#39', title: 'Right Balance (Work-Life)', cat: 'society', stance: 'both_sides',
    question: 'How important is work-life balance and what makes it hard to achieve?',
    stanceText: 'Maintaining a healthy work-life balance is extremely important for our overall well-being.',
    keywords: ['burnout', 'mental health', 'work culture', 'always-on', 'personal relationships'],
    body1: {
      claim: 'This balance is vital for our mental health and personal relationships.',
      evidence: [
        'Constant overwork can lead to high stress and make people feel tired and unhappy.',
        'Spending quality time with family strengthens bonds and creates happy memories.',
        'Good balance helps prevent burnout and keeps us motivated in both life and work.',
      ],
    },
    body2: {
      claim: 'Modern work culture and technology make this balance hard to achieve for many people.',
      evidence: [
        'Many jobs now expect quick replies to emails and messages during personal time.',
        'The high cost of living forces people to work longer hours and take on extra jobs.',
        'The habit of checking work phones constantly blurs the line between office and home.',
      ],
    },
  },
  {
    n: 9, id: 'WE#40', title: 'Personal Life (Time Shortage)', cat: 'society', stance: 'both_sides',
    question: 'Work leaves little time for people\'s personal life. How widespread is this and how can we solve it?',
    stanceText: 'This problem is highly widespread, but can be effectively solved through individual discipline and workplace policies.',
    keywords: ['overwork', 'always-on culture', 'flexible schedules', 'work notifications', 'maximum work hours'],
    body1: {
      claim: 'The problem of overwork is widespread, especially in competitive industries and demanding corporate cultures.',
      evidence: [
        'In many tech companies, employees are often expected to work late nights and on weekends, leaving no time for rest.',
        'Young professionals in big cities feel pressured to devote all their time to their job to secure promotions.',
        'The "always-on" culture from emails and messaging apps makes it hard for people to truly disconnect from work.',
      ],
    },
    body2: {
      claim: 'The solution requires both personal efforts to set boundaries and employers creating policies that respect private time.',
      evidence: [
        'People can solve this by strictly turning off work notifications after a set hour each evening.',
        'Companies can help by offering flexible schedules or remote work options.',
        'Governments can pass laws encouraging better work-life balance, like limiting maximum weekly work hours.',
      ],
    },
  },
  {
    n: 10, id: 'WE#43', title: 'Legal Responsibility (Parents)', cat: 'society', stance: 'agree',
    question: 'Should parents be held legally responsible for the actions of their children?',
    stanceText: 'I strongly agree that parents should be held legally responsible for the actions of their children.',
    keywords: ['legal guardianship', 'compensation', 'parental supervision', 'educational duty', 'public safety'],
    body1: {
      claim: 'Legal responsibility ensures that victims receive fair compensation when children cause damage.',
      evidence: [
        'If a child breaks a neighbor\'s window while playing, the parents must pay for the repair.',
        'When a child damages property in a cinema, the parents are legally responsible for the financial cost.',
        'This rule makes parents more careful in supervising their children in public places to prevent accidents.',
      ],
    },
    body2: {
      claim: 'This legal obligation motivates parents to fulfill their duty of education and supervision.',
      evidence: [
        'Knowing they are legally responsible, parents are more likely to teach their children about safety and rules.',
        'This law encourages parents to correct bad habits early, like playing with dangerous objects.',
        'Proper parental guidance at home can prevent children from causing serious trouble outside.',
      ],
    },
  },
  {
    n: 11, id: 'WE#46', title: 'Worker Decision-Making', cat: 'economy', stance: 'both_sides',
    question: 'What are the advantages and disadvantages of involving workers in the decision-making process?',
    stanceText: 'Involving workers in decision-making brings more advantages than disadvantages.',
    keywords: ['employee engagement', 'morale', 'operational efficiency', 'front-line staff', 'strategic decisions'],
    body1: {
      claim: 'The main advantage is that it leads to better, more practical products and a happier workforce.',
      evidence: [
        'Workers on the production line often have the best ideas to improve the products they make every day.',
        'Involving front-line staff in decision-making helps create services that better meet real customer needs.',
        'When workers feel heard, they are more motivated and loyal to the company.',
      ],
    },
    body2: {
      claim: 'The main disadvantage is that the process can be slower and may lead to internal conflicts.',
      evidence: [
        'Discussing every decision with many workers can slow down the process and make companies less efficient.',
        'Different groups of workers might disagree strongly, creating arguments and slowing down projects.',
        'Not all workers have the big-picture knowledge needed to make good strategic decisions for the company.',
      ],
    },
  },
  {
    n: 12, id: 'WE#56', title: 'Experiential Learning', cat: 'education', stance: 'agree',
    question: 'Can experiential learning (learning by doing) work well in high schools or colleges?',
    stanceText: 'Experiential learning can work very well in high schools and colleges.',
    keywords: ['hands-on learning', 'lab experiments', 'teamwork', 'problem-solving', 'soft skills'],
    body1: {
      claim: 'This method makes complex knowledge practical and helps students understand and remember it better.',
      evidence: [
        'Science students learn physics best by doing real experiments in a school lab, not just reading.',
        'Running a small company project in class teaches business skills better than only using textbooks.',
        'History becomes engaging when students visit museums or act out important historical events.',
      ],
    },
    body2: {
      claim: 'Experiential learning develops key soft skills like problem-solving and teamwork for future success.',
      evidence: [
        'Group projects in high school teach students how to communicate and work together effectively.',
        'Facing real challenges in a hands-on project trains students to think creatively and find solutions.',
        'Presenting a project result builds confidence and public speaking skills for college students.',
      ],
    },
  },
  {
    n: 13, id: 'WE#58', title: 'Play Writing', cat: 'education', stance: 'agree',
    question: 'What is the role of writing theater plays and discussing historical writings for high school students?',
    stanceText: 'Analyzing historical writings and creating theater plays are crucial for high school students.',
    keywords: ['critical thinking', 'empathy', 'cultural heritage', 'communication skills', 'historical context'],
    body1: {
      claim: 'These activities significantly improve students\' ability to think critically and empathize with others.',
      evidence: [
        'Writing a play about a historical figure forces you to imagine their motives, developing deeper empathy.',
        'Comparing a textbook\'s historical account with a personal letter makes studying the past feel more real.',
        'Students must analyze why characters in their plays make certain choices, which strengthens critical thinking.',
      ],
    },
    body2: {
      claim: 'They actively connect students to cultural heritage and enhance their communication skills.',
      evidence: [
        'Performing a theater play set in the past lets students experience and understand that culture in a memorable way.',
        'Debating the author\'s perspective in a historical document makes old writings relevant to students\' lives today.',
        'The process of writing plays requires students to express complex ideas and emotions clearly to an audience.',
      ],
    },
  },
  {
    n: 14, id: 'WE#63', title: 'Mark Deduction', cat: 'education', stance: 'partial',
    question: 'Some universities deduct marks for late submissions. What is your opinion? What alternatives do you recommend?',
    stanceText: 'Deducting marks for late submission is a fair but imperfect policy and better alternatives exist.',
    keywords: ['academic deadline', 'professional discipline', 'fairness', 'constructive penalty', 'late submission'],
    body1: {
      claim: 'This policy teaches students important lessons about responsibility and real-world deadlines.',
      evidence: [
        'It clearly shows that meeting deadlines is a basic requirement for academic work.',
        'This rule prepares students for future workplace expectations and professional discipline.',
        'It ensures fair competition among all students submitting their work on time.',
      ],
    },
    body2: {
      claim: 'Alternative approaches can better support learning without sacrificing fairness.',
      evidence: [
        'Teachers could give students one or two free passes for late work each semester.',
        'Requiring students to do extra academic work is better than just lowering their grades.',
        'The penalty should increase if a student submits late work too often.',
      ],
    },
  },
  {
    n: 15, id: 'WE#71', title: 'Extending Life Expectancy', cat: 'health', stance: 'agree',
    question: 'Medical technology is responsible for increasing average life expectancy. Is this a curse or a blessing?',
    stanceText: 'Medical technology increasing life expectancy is a blessing.',
    keywords: ['vaccines', 'MRI scanners', 'pacemakers', 'chronic illness', 'joint replacement surgery'],
    body1: {
      claim: 'This is a blessing because it directly saves lives and alleviates human suffering.',
      evidence: [
        'Vaccines prevent deadly diseases and are a clear reason for longer life expectancy.',
        'Machines like MRI scanners help doctors find diseases early, making treatment easier and increasing healthy life years.',
        'Simple medical tools like pacemakers can fix heart problems, letting people live longer and more active lives.',
      ],
    },
    body2: {
      claim: 'It improves the overall quality of life for individuals and society.',
      evidence: [
        'Pain management technology helps patients with chronic illness live more comfortably despite their age.',
        'Advances in joint replacement surgery allow older people to stay mobile, maintaining their independence for longer.',
        'New medicines turn once-fatal conditions into manageable ones, giving patients hope and more life.',
      ],
    },
  },
  {
    n: 16, id: 'WE#72', title: 'Building Effects', cat: 'society', stance: 'both_sides',
    question: 'Does the design of buildings affect, positively or negatively, where people live and work?',
    stanceText: 'Good building design makes the places we live and work in much nicer to be in.',
    keywords: ['natural light', 'urban design', 'community space', 'accessibility', 'well-being'],
    body1: {
      claim: 'A well-designed building makes daily life easier and more pleasant.',
      evidence: [
        'Lots of natural light in apartments saves electricity and makes people feel good at home.',
        'Having a shop or a cafe on the ground floor makes the street more lively and convenient.',
        'A nice lobby or courtyard gives people a place to meet their neighbors and relax.',
      ],
    },
    body2: {
      claim: 'A poorly designed building can make an area feel uncomfortable and unwelcoming.',
      evidence: [
        'A huge building with no windows looks cold and makes the street feel depressing.',
        'If a new office blocks the sun, the park next to it becomes cold and empty.',
        'Buildings that are hard to get to by bus or foot feel cut off from the rest of the town.',
      ],
    },
  },
  {
    n: 17, id: 'WE#75', title: 'Personal Life (Overwork Harms)', cat: 'society', stance: 'both_sides',
    question: 'People who devote too much time to work leave little time for personal life. How widespread is this? What problems does it cause?',
    stanceText: 'This problem is extremely widespread and causes significant harm to individuals\' physical and mental health.',
    keywords: ['chronic stress', 'sleep problems', 'family relationships', 'burnout', 'always-on culture'],
    body1: {
      claim: 'The problem of overwork is widespread, especially in competitive industries.',
      evidence: [
        'In many tech companies, employees are often expected to work late nights and on weekends.',
        'Young professionals in big cities feel pressured to devote all their time to their job.',
        'The "always-on" culture from emails and messaging apps makes it hard to truly disconnect.',
      ],
    },
    body2: {
      claim: 'This shortage of personal time causes severe problems including poor health and broken relationships.',
      evidence: [
        'Constantly devoting time to work leads to chronic stress, sleep problems, and even serious illnesses.',
        'People who have no time for family dinners or children\'s events damage their closest relationships.',
        'Without private time for hobbies, people can feel empty, bored, and lose their sense of self.',
      ],
    },
  },
  {
    n: 18, id: 'WE#76', title: 'Facing Issues (Climate Change)', cat: 'environment', stance: 'agree',
    question: 'Which global problem is most pressing and what is the solution?',
    stanceText: 'Climate change is the most serious global problem, and only governments and international organizations can solve it.',
    keywords: ['droughts', 'sea levels', 'extreme storms', 'carbon emissions', 'clean energy'],
    body1: {
      claim: 'Climate change brings terrible harm to people\'s lives and the whole world.',
      evidence: [
        'Droughts ruin crops and make millions of people face food shortages globally.',
        'Rising sea levels pollute fresh water and threaten coastal communities worldwide.',
        'Extreme storms destroy homes and bring great losses to many countries around the world.',
      ],
    },
    body2: {
      claim: 'Governments and international groups can take practical steps to fight climate change.',
      evidence: [
        'Governments make rules and limit pollution from factories in their own countries.',
        'International organizations help poor nations build clean energy systems with solar power.',
        'They work together and encourage all countries to cut carbon emissions actively.',
      ],
    },
  },
  {
    n: 19, id: 'WE#77', title: 'Studying Theater', cat: 'education', stance: 'both_sides',
    question: 'What are the problems and benefits for high school students of studying plays written centuries ago?',
    stanceText: 'The benefits of studying centuries-old theatre works for high school students far outweigh the problems.',
    keywords: ['archaic language', 'cultural heritage', 'critical thinking', 'universal emotions', 'teamwork'],
    body1: {
      claim: 'The main problems are the difficult language and the distant social contexts of these old plays.',
      evidence: [
        'The old English in Shakespeare\'s plays is hard for students to understand without a glossary or modern translation.',
        'References to outdated customs in old theatre works can seem confusing and irrelevant to a student\'s life today.',
        'The complex plots and long speeches can test the patience and focus of many high school students.',
      ],
    },
    body2: {
      claim: 'However, the benefits are profound — these works teach universal emotions and sharpen critical thinking.',
      evidence: [
        'Analyzing the motives of characters in ancient plays helps students better understand human nature.',
        'Performing a scene from a centuries-old theatre work builds students\' confidence and teamwork skills.',
        'Discussing themes of power or love in old plays makes students form and defend their own opinions thoughtfully.',
      ],
    },
  },
  {
    n: 20, id: 'WE#86', title: 'Digital Materials', cat: 'technology', stance: 'both_sides',
    question: 'Should universities only procure digital media rather than constantly update textbooks? Discuss advantages and disadvantages.',
    stanceText: 'Replacing textbooks with digital media has both distinct advantages and notable drawbacks.',
    keywords: ['online resources', 'digital libraries', 'misinformation', 'copyright protection', 'e-books'],
    body1: {
      claim: 'Digital media is more convenient — it offers instant access, easy storage, and flexible use.',
      evidence: [
        'Online resources help students get immediate information, global news, and research papers without waiting.',
        'Digital libraries let students save unlimited files without occupying physical space.',
        'E-books support use on phones, adapt to different devices, and sync reading progress across platforms.',
      ],
    },
    body2: {
      claim: 'Digital media has too much false knowledge, fake headlines, and unverified content.',
      evidence: [
        'Online forums let anyone post opinions and share unconfirmed rumors, often lacking professional supervision.',
        'Printed books have professional editors and trusted publishers to ensure accuracy.',
        'Digital content risks piracy, while textbooks have stricter copyright protection.',
      ],
    },
  },
  {
    n: 21, id: 'WE#90', title: 'Age Limit', cat: 'society', stance: 'agree',
    question: 'Age restrictions are placed on many activities. Give an example and state what minimum age you think it should be.',
    stanceText: 'Age restrictions are necessary and reasonable for many activities, as they protect young people and ensure social responsibility.',
    keywords: ['minimum age', 'maturity', 'driving', 'alcohol', 'emotional readiness'],
    body1: {
      claim: 'Age restrictions are crucial for protecting the physical and mental safety of young people who lack maturity.',
      evidence: [
        'A minimum age of 18 for driving is sensible because it requires focus and good judgment to avoid accidents.',
        'Restricting alcohol purchase to adults protects teenagers from potential health risks and bad decisions.',
        'Setting an age limit for violent movies helps shield children from content they are not emotionally ready to process.',
      ],
    },
    body2: {
      claim: 'These restrictions ensure individuals have enough life experience to make serious commitments or decisions.',
      evidence: [
        'The legal age for marriage should be at least 18, as it requires emotional and financial maturity.',
        'Voting should be reserved for people over 18 who can understand political issues and their consequences.',
        'A minimum age to sign important contracts prevents young people from making binding promises they don\'t fully understand.',
      ],
    },
  },
  {
    n: 22, id: 'WE#102', title: 'Life Experience', cat: 'education', stance: 'both_sides',
    question: 'Experience is the best teacher — life experiences teach people more than books or formal education. How far do you agree?',
    stanceText: 'Both personal experience and formal learning are essential teachers — they serve different and complementary roles.',
    keywords: ['hands-on experience', 'practical skills', 'foundational knowledge', 'theory', 'cultural understanding'],
    body1: {
      claim: 'Practical experience is an invaluable teacher because it provides direct, unforgettable lessons.',
      evidence: [
        'Learning to ride a bike by actually falling teaches balance better than any instruction manual.',
        'Working a part-time job teaches responsibility and time management in a way that school cannot.',
        'Traveling to a new country gives you a real understanding of its culture that books alone cannot offer.',
      ],
    },
    body2: {
      claim: 'Books and formal education provide the foundational knowledge and theory necessary to apply experience wisely.',
      evidence: [
        'You need to study basic math from a book before you can successfully manage a personal budget in real life.',
        'Learning history from textbooks helps us understand current events and avoid past mistakes.',
        'Formal science education teaches you the methods to analyze and learn from your own experiments.',
      ],
    },
  },
  {
    n: 23, id: 'WE#106', title: 'Effective Study', cat: 'education', stance: 'partial',
    question: 'It is impossible to combine a student\'s learning with employment. To what extent is this realistic?',
    stanceText: 'I partially disagree that employment makes effective study impossible.',
    keywords: ['time management', 'part-time job', 'flexible hours', 'study schedule', 'work-study balance'],
    body1: {
      claim: 'Combining study and employment is challenging, but it can teach invaluable time management and practical skills.',
      evidence: [
        'Having a part-time job forces a student to plan their study schedule carefully, wasting less time.',
        'A student working in a cafe learns customer service, which is a useful skill not taught in class.',
        'Earning their own money can make a student more responsible and motivated in all areas of life.',
      ],
    },
    body2: {
      claim: 'The key to effective study alongside work is choosing the right job and maintaining a strict balance.',
      evidence: [
        'A student should choose a job with flexible hours that does not conflict with important exam periods.',
        'Learning to say no to extra work shifts is crucial for protecting study time and avoiding distraction.',
        'Effective study after work requires a quiet space and turning off phone notifications to find peace.',
      ],
    },
  },
  {
    n: 24, id: 'WE#116', title: 'Public Transportation', cat: 'economy', stance: 'both_sides',
    question: 'What are the advantages and problems of cheaper public transportation?',
    stanceText: 'There are both benefits and drawbacks of cheaper public transportation.',
    keywords: ['low-income commuters', 'traffic congestion', 'overcrowding', 'budget constraints', 'service quality'],
    body1: {
      claim: 'Affordable transit systems greatly boost people\'s happiness and city efficiency.',
      evidence: [
        'Low-income people can travel by metro and bus with less expenses.',
        'Fewer commuters drive their private vehicles, cutting traffic jams and enhancing efficiency.',
        'Citizens benefit from better health as air pollution and fuel consumption sharply decline.',
      ],
    },
    body2: {
      claim: 'Low-cost public transport leads to bad experiences, such as overcrowding and poor service quality.',
      evidence: [
        'Overloaded vehicles increase travel time and discomfort for passengers.',
        'Staff shortages worsen due to budget constraints on hiring and training.',
        'The unprofitable transport system may cause frequent delays or breakdowns.',
      ],
    },
  },
  {
    n: 25, id: 'WE#124', title: 'Studying Abroad', cat: 'education', stance: 'disagree',
    question: 'It is often argued that studying overseas is overrated. To what extent do you agree?',
    stanceText: 'I disagree that studying overseas is overrated.',
    keywords: ['personal growth', 'global perspective', 'international network', 'language fluency', 'career advantage'],
    body1: {
      claim: 'Studying overseas provides unmatched opportunities for personal growth and global perspective.',
      evidence: [
        'Living alone in a foreign country forces students to become independent and solve daily problems themselves.',
        'Experiencing a different culture firsthand challenges your own views and makes you more open-minded.',
        'Building a network of international friends creates lifelong connections across the globe.',
      ],
    },
    body2: {
      claim: 'The academic and career advantages gained from an overseas education are highly significant.',
      evidence: [
        'Top universities overseas often have more resources and famous professors in specific research fields.',
        'A degree from a well-known foreign university can make your resume stand out to future employers.',
        'Being fluent in another language is a powerful skill best learned by studying in that country.',
      ],
    },
  },
  {
    n: 26, id: 'WE#149', title: 'Law Effect', cat: 'society', stance: 'agree',
    question: 'Some people think human behavior can be changed by laws, while others think laws have little effect. What is your opinion?',
    stanceText: 'Laws have a powerful and essential effect in shaping and changing human behavior.',
    keywords: ['legislation', 'penalties', 'social norms', 'smoking bans', 'seat-belt laws'],
    body1: {
      claim: 'Laws effectively change dangerous or unfair behavior by setting clear, enforceable rules with penalties.',
      evidence: [
        'Traffic laws like speed limits change drivers\' behavior by making dangerous driving illegal and punishable.',
        'Strict laws against theft directly prevent this harmful behavior by threatening criminals with prison time.',
        'Workplace safety laws force companies to change their practices and protect workers from injury.',
      ],
    },
    body2: {
      claim: 'Beyond punishment, laws guide and educate society, gradually changing social norms and long-term habits.',
      evidence: [
        'Smoking bans in public places have gradually changed people\'s views, making smoking seem less socially acceptable.',
        'Recycling laws teach people new habits and increase public awareness about environmental responsibility.',
        'Laws requiring seat-belt use have saved lives and made this safety behavior normal for most drivers.',
      ],
    },
  },
  {
    n: 27, id: 'WE#155', title: 'Studying Climate Change', cat: 'environment', stance: 'agree',
    question: 'You have been assigned to study climate change. Which area will you focus on and why?',
    stanceText: 'I would focus on how rising sea levels affect the homes and lives of millions of coastal residents.',
    keywords: ['rising sea levels', 'coastal flooding', 'farmland damage', 'property values', 'sea walls'],
    body1: {
      claim: 'Rising sea levels pose an immediate threat — flooding coastal cities, damaging property, and forcing people to move.',
      evidence: [
        'In low-lying cities, tides and storms now cause more frequent street flooding, disrupting daily life.',
        'Saltwater from rising seas can ruin farmland near the coast, hurting local food production and farmers\' income.',
        'The risk of permanent flooding is lowering property values in many coastal towns and neighborhoods.',
      ],
    },
    body2: {
      claim: 'This focus is urgent because it pushes us to find practical solutions that protect communities.',
      evidence: [
        'Studying this helps engineers design better sea walls and drainage systems to protect coastal cities.',
        'It allows governments to create smarter zoning laws to avoid building new homes in high-risk flood areas.',
        'Understanding the threat encourages investment in restoring coastal ecosystems.',
      ],
    },
  },
  {
    n: 28, id: 'WE#156', title: 'Tourism\'s Pros and Cons', cat: 'economy', stance: 'both_sides',
    question: 'For a less developed country, the disadvantages of tourism are as great as the advantages. Discuss.',
    stanceText: 'For a less developed country, the disadvantages of tourism can indeed be as significant as its advantages.',
    keywords: ['economic revenue', 'job creation', 'environmental damage', 'cultural authenticity', 'infrastructure'],
    body1: {
      claim: 'The main advantages are economic — tourism brings in money, creates jobs, and helps develop local infrastructure.',
      evidence: [
        'Tourism creates jobs in hotels and restaurants, providing income for local people.',
        'Money spent by tourists on souvenirs and food directly supports local businesses and families.',
        'The government can use tourism revenue to build better roads and schools for the local community.',
      ],
    },
    body2: {
      claim: 'However, serious disadvantages follow — including harm to the environment and disruption of local culture.',
      evidence: [
        'Large numbers of tourists can pollute beaches and natural sites, damaging the environment that attracts them.',
        'The local culture may be changed to please tourists, losing its original meaning and authenticity.',
        'Resources like water and land may be used for resorts instead of meeting the needs of local people.',
      ],
    },
  },
  {
    n: 29, id: 'WE#159', title: 'Inventions (AI)', cat: 'technology', stance: 'agree',
    question: 'Describe a new invention and determine whether it has a beneficial or detrimental impact on society.',
    stanceText: 'Artificial Intelligence (AI) is a powerful new invention with a beneficial impact on society.',
    keywords: ['self-driving cars', 'medical diagnosis', 'robotic arms', 'smart assistants', 'educational apps'],
    body1: {
      claim: 'AI has a beneficial impact by improving efficiency and safety across various fields.',
      evidence: [
        'The invention of AI in self-driving cars can reduce human error and make road travel much safer.',
        'AI helps doctors diagnose diseases earlier and more accurately, saving many lives.',
        'In factories, robotic arms handle dangerous tasks, protecting workers from harm.',
      ],
    },
    body2: {
      claim: 'AI creates more opportunities and personalizes our daily experiences.',
      evidence: [
        'Smart assistants provide personalized reminders and controls for our smart homes.',
        'AI requires people to learn new skills, creating jobs in programming and data analysis.',
        'Educational apps adapt to each student\'s learning pace and style.',
      ],
    },
  },
  {
    n: 30, id: 'WE#160', title: 'Television', cat: 'media', stance: 'partial',
    question: 'Television helps people relax, learn, and serves as a companion for the lonely. To what extent do you agree?',
    stanceText: 'While television is a valuable source of entertainment, its more important role is to provide reliable information.',
    keywords: ['documentary', 'news programs', 'public service announcements', 'entertainment', 'companionship'],
    body1: {
      claim: 'The primary value of television lies in its power to inform and educate viewers about the world.',
      evidence: [
        'Watching a documentary on television teaches me about wildlife and ecosystems I have never seen.',
        'Trusted news programs on TV provide important information about local and global events every day.',
        'Public service announcements on TV channels can educate people about health, safety, and legal rights.',
      ],
    },
    body2: {
      claim: 'Although its entertainment role is significant, it serves mainly for relaxation and does not match the essential need for information.',
      evidence: [
        'A funny comedy show offers great entertainment and helps me relax after a tiring day.',
        'Reality TV programs are popular for entertainment, but often provide little useful information or knowledge.',
        'For many elderly people living alone, the TV serves as a comforting companion with its sounds and stories.',
      ],
    },
  },
  {
    n: 31, id: 'WE#162', title: 'Fewer Work Hours', cat: 'economy', stance: 'agree',
    question: '"In the future, people will work fewer hours at their jobs than they do now." Do you agree?',
    stanceText: 'I agree that in the future, people will work fewer hours.',
    keywords: ['automation', 'artificial intelligence', 'four-day work week', 'remote work', 'work-life balance'],
    body1: {
      claim: 'Advanced automation and AI will take over many routine tasks, reducing the need for long human work hours.',
      evidence: [
        'Robots in factories can assemble products much faster, allowing human workers to have more free time.',
        'AI software can now handle data analysis and customer service jobs that once required long office hours.',
        'Self-driving technology may allow delivery and transport jobs to be done with minimal human supervision.',
      ],
    },
    body2: {
      claim: 'There is growing support for policies like a four-day work week to improve life quality and mental health.',
      evidence: [
        'Some companies are already testing shorter work weeks and finding people are happier and equally productive.',
        'In the future, governments may pass laws to encourage fewer work hours as a standard for better balance.',
        'Younger workers today often value personal time more and will likely push for shorter work hours.',
      ],
    },
  },
  {
    n: 32, id: 'WE#163', title: 'Celebrities\' Privacy', cat: 'society', stance: 'disagree',
    question: 'Famous entertainers or sportspeople should give up the right to privacy as the price of fame. To what extent do you agree?',
    stanceText: 'I disagree that famous entertainers and sportspeople should give up their right to privacy.',
    keywords: ['mental health', 'media attention', 'stalkers', 'harassment', 'personal boundaries'],
    body1: {
      claim: 'Everyone, including the famous, deserves a private life for their mental health and personal relationships.',
      evidence: [
        'Constant media attention invades the private family life of famous people, causing great stress.',
        'Sportspeople and entertainers need time away from the public eye to relax and recharge.',
        'Following famous people everywhere, even on vacation, is an unfair invasion of their basic right to privacy.',
      ],
    },
    body2: {
      claim: 'Complete loss of privacy can lead to serious safety risks and set a harmful social precedent.',
      evidence: [
        'Sharing the real-time locations of famous entertainers online can attract dangerous stalkers.',
        'Accepting that losing privacy is part of being famous makes harassing stars seem normal.',
        'Sportspeople should not have their medical records or home addresses exposed just because they are public figures.',
      ],
    },
  },
  {
    n: 33, id: 'WE#166', title: 'Short Weeks (Youth Unemployment)', cat: 'economy', stance: 'both_sides',
    question: 'Shortening the working week is suggested as a solution to youth unemployment. What are the advantages and disadvantages?',
    stanceText: 'Shortening the working week for the whole workforce, not just young workers, is a worthwhile policy.',
    keywords: ['youth unemployment', 'job openings', 'work-life balance', 'productivity', 'income reduction'],
    body1: {
      claim: 'The main advantage is that it can create more job openings and improve work-life balance for everyone.',
      evidence: [
        'If current employees work fewer hours, companies may need to hire more young workers to cover the shifts.',
        'A shorter working week gives all workers more time for family, hobbies, and rest, reducing burnout.',
        'Sharing available work hours among more people can directly lower the overall unemployment rate.',
      ],
    },
    body2: {
      claim: 'The main disadvantage is that it could reduce business productivity and individual income.',
      evidence: [
        'Companies might produce less if everyone works fewer hours, potentially hurting the economy.',
        'Workers could earn less money if their pay is cut along with their working hours.',
        'Applying this policy only to young workers could cause resentment and unfairness in the whole workforce.',
      ],
    },
  },
  {
    n: 34, id: 'WE#170', title: 'Compulsory Learning (Foreign Language)', cat: 'education', stance: 'agree',
    question: 'Some people think learning a foreign language at school should be compulsory. To what extent do you agree?',
    stanceText: 'I strongly agree that learning a foreign language should be compulsory in school.',
    keywords: ['cognitive skills', 'logical thinking', 'global job market', 'cultural access', 'vocabulary'],
    body1: {
      claim: 'Making it compulsory develops key cognitive skills and academic discipline for all students.',
      evidence: [
        'Studying a language\'s grammar improves your logical thinking and attention to detail.',
        'Memorizing vocabulary and practicing pronunciation strengthens memory and listening skills.',
        'The regular practice required for language class builds good study habits useful in all subjects.',
      ],
    },
    body2: {
      claim: 'It provides indispensable preparation for life in an interconnected world and the global job market.',
      evidence: [
        'Knowing another language allows direct access to different cultures through their films, music, and news.',
        'Many international companies prefer candidates who can communicate with clients and colleagues abroad.',
        'It makes traveling easier and more rewarding, as you can connect with locals beyond tourist spots.',
      ],
    },
  },
  {
    n: 35, id: 'WE#171', title: 'Old or Modern Buildings', cat: 'society', stance: 'both_sides',
    question: 'Many countries spend large amounts on restoring historic buildings rather than modern housing. Do you agree or disagree?',
    stanceText: 'While preserving historic buildings offers cultural value, prioritizing it over modern housing creates significant trade-offs.',
    keywords: ['cultural heritage', 'tourism revenue', 'affordable housing', 'identity', 'government funds'],
    body1: {
      claim: 'Spending on historic buildings preserves cultural heritage and can stimulate sustainable economic growth.',
      evidence: [
        'Restored historic landmarks attract tourists, generating income and creating jobs for the local community.',
        'These buildings provide a direct, tangible link to the past, offering unique educational value for all citizens.',
        'Maintaining historic city centers can foster a unique identity and sense of pride among local residents.',
      ],
    },
    body2: {
      claim: 'However, this focus often comes at the expense of addressing the urgent need for affordable modern housing.',
      evidence: [
        'The enormous cost of restoring a single palace could fund the construction of an entire new neighborhood of affordable homes.',
        'Many working families in cities struggle with high rents, a problem more pressing than visiting a restored museum.',
        'Government funds are limited, so money spent on old buildings leaves less for schools, clinics, and new housing projects.',
      ],
    },
  },
  {
    n: 36, id: 'WE#173', title: 'Harder Life (21st Century Children)', cat: 'society', stance: 'partial',
    question: 'It is harder for children to grow up in the 21st century than it was in the past. How far do you agree?',
    stanceText: 'I partially agree — growing up in the 21st century is both more challenging and more promising than in the past.',
    keywords: ['academic pressure', 'online bullying', 'social media', 'modern medicine', 'global awareness'],
    body1: {
      claim: 'Growing up is harder due to intense academic pressure and the challenges of the online world.',
      evidence: [
        'Children today face much more homework and exams than in the past, creating constant stress.',
        'The internet exposes children to online bullying and harmful content, which was less common in the past.',
        'Social media makes many children worry too much about their looks and popularity among peers.',
      ],
    },
    body2: {
      claim: 'However, growing up today also provides better access to information, healthcare, and global awareness.',
      evidence: [
        'Children can use the internet to learn about any topic, which was very difficult in the past.',
        'Modern medicine and vaccines protect children from many diseases that were deadly in the past.',
        'Through technology, children today can easily learn about different cultures and global issues.',
      ],
    },
  },
  {
    n: 37, id: 'WE#174', title: 'Wage Cap', cat: 'economy', stance: 'disagree',
    question: 'Many people say there should be a maximum wage for high-paying jobs. Do you support this?',
    stanceText: 'I do not support setting a maximum wage for high-paying jobs.',
    keywords: ['innovation', 'talent retention', 'progressive taxes', 'minimum wage', 'brain drain'],
    body1: {
      claim: 'A maximum wage could reduce the motivation for people to innovate, take risks, and excel.',
      evidence: [
        'Top scientists or doctors might work less hard if there is a strict maximum on their potential income.',
        'Entrepreneurs starting new companies often take big risks for the chance of a very high-paying future reward.',
        'Setting a pay maximum could make some talented people choose to work in other countries without such limits.',
      ],
    },
    body2: {
      claim: 'The real issue is ensuring fair opportunities and a decent minimum living standard — not capping high salaries.',
      evidence: [
        'Instead of capping high salaries, governments can use progressive taxes on the wealthy to fund public services.',
        'Focusing on better education and job training creates more opportunities for people to earn good money fairly.',
        'A high minimum wage and strong worker protections often help low-income families more than a maximum wage cap.',
      ],
    },
  },
  {
    n: 38, id: 'WE#183', title: 'City or Countryside', cat: 'society', stance: 'agree',
    question: 'Some people prefer to live in cities, others in the countryside. Which is better for you?',
    stanceText: 'Living in cities is much better than living in the countryside — it offers more opportunities, convenience, and excitement.',
    keywords: ['universities', 'international firms', 'public transport', 'cultural activities', 'career growth'],
    body1: {
      claim: 'Cities provide far more educational and job opportunities, crucial for young people\'s development.',
      evidence: [
        'There are many more universities and training centers in cities for people who want to learn new skills.',
        'Most large companies and international firms are located in cities, offering a wider range of job opportunities.',
        'Young professionals can find better-paying careers and faster promotions in a competitive city environment.',
      ],
    },
    body2: {
      claim: 'Life in cities is much more convenient and culturally vibrant, with everything you need close by.',
      evidence: [
        'Public transport like subways and buses makes it easy to get anywhere without a car.',
        'You can find restaurants, cinemas, and shops open late at night, which is rare in the countryside.',
        'Cities host museums, concerts, and festivals, offering constant cultural activities that the countryside cannot match.',
      ],
    },
  },
  {
    n: 39, id: 'WE#184', title: 'Foreign Languages (vs AI)', cat: 'technology', stance: 'disagree',
    question: 'AI can translate foreign languages, making learning a foreign language unnecessary. To what extent do you agree?',
    stanceText: 'I completely disagree that advanced AI translation makes learning a foreign language unnecessary.',
    keywords: ['cognitive skills', 'cultural insight', 'translation error', 'business negotiations', 'phone battery'],
    body1: {
      claim: 'Learning a foreign language develops unique cognitive and social skills that computers cannot replicate.',
      evidence: [
        'The process of learning a language improves memory, problem-solving, and even skills in your native tongue.',
        'Speaking directly to someone in their language builds a much stronger personal connection than using AI translation.',
        'Understanding jokes, idioms, and tone in another language requires cultural insight that AI translation often misses.',
      ],
    },
    body2: {
      claim: 'Relying only on AI for translation creates practical risks and limits personal and professional opportunities.',
      evidence: [
        'In critical situations like business talks, a small AI translation error could lead to major misunderstandings.',
        'Many employers value candidates who have learned a foreign language, seeing it as discipline and cultural respect.',
        'If your phone battery dies in a foreign country, you cannot use AI translation, making basic tasks very difficult.',
      ],
    },
  },
  {
    n: 40, id: 'WE#195', title: 'Marketing in Companies', cat: 'economy', stance: 'disagree',
    question: 'Should consumer goods companies emphasize company reputation or short-term strategies like discounts?',
    stanceText: 'For long-term success, consumer goods companies should place greater emphasis on reputation over short-term discount strategies.',
    keywords: ['brand reputation', 'customer loyalty', 'word-of-mouth', 'discount dependency', 'brand identity'],
    body1: {
      claim: 'Building a strong reputation for quality and trust creates loyal customers and ensures stable growth.',
      evidence: [
        'A clothing company known for durable materials and fair labor will keep customers coming back for years.',
        'Food companies with a reputation for safety and natural ingredients can charge fair prices without constant discounts.',
        'When companies focus on reputation, people recommend them to friends — free and powerful marketing.',
      ],
    },
    body2: {
      claim: 'Overusing short-term strategies like constant discounts can harm profits and make the brand seem cheap.',
      evidence: [
        'Frequent special offers on clothing can train customers to only buy on sale, hurting regular-price sales.',
        'If a food company always uses discounts, people might doubt the real value and quality of its products.',
        'Relying only on short-term strategies makes it hard to build a lasting, respected brand identity.',
      ],
    },
  },
  {
    n: 41, id: 'WE#215', title: 'Best Teachers (Experience)', cat: 'education', stance: 'agree',
    question: 'Experience is the best teacher. It is more effective than formal school study and books. What do you think?',
    stanceText: 'Experience is a better teacher than books or school.',
    keywords: ['practical skills', 'applied wisdom', 'confidence', 'adaptability', 'empathy'],
    body1: {
      claim: 'Hands-on experience is more valuable because it builds practical skills for real-life challenges.',
      evidence: [
        'Experience teaches problem-solving in real situations, while books only offer theoretical solutions.',
        'Learning by doing creates lasting memories, whereas reading often leads to quick forgetting.',
        'Mistakes made in real life teach stronger lessons than mistakes corrected on paper.',
      ],
    },
    body2: {
      claim: 'Real-world experience develops character better than textbooks — teaching confidence, adaptability and empathy.',
      evidence: [
        'Experience builds confidence through action, but books only provide passive knowledge.',
        'Facing challenges shapes adaptability and builds resilience, unlike studying abstract concepts.',
        'Personal interactions in everyday life teach empathy better than written stories.',
      ],
    },
  },
  {
    n: 42, id: 'WE#261', title: 'Travel for Education', cat: 'education', stance: 'disagree',
    question: 'Some believe the value of travel is highly overrated. To what extent do you agree that travel is not necessary for quality education?',
    stanceText: 'I firmly believe that travel is a necessary component of a quality education.',
    keywords: ['historical sites', 'cultural art', 'independence', 'global citizenship', 'adaptability'],
    body1: {
      claim: 'Travel makes academic knowledge concrete and memorable, directly supporting a quality education.',
      evidence: [
        'Visiting historical sites turns dates from a textbook into a real story you can feel and remember.',
        'Seeing geography like mountains or rivers in person is a much better lesson than looking at pictures in class.',
        'Experiencing cultural art and food firsthand teaches more about it than any lecture on the subject.',
      ],
    },
    body2: {
      claim: 'Travel develops critical life skills like adaptability and empathy that are essential for success.',
      evidence: [
        'Navigating a foreign city builds independence and problem-solving skills that are key parts of a quality education.',
        'Interacting with people from different backgrounds is the best way to learn tolerance and global citizenship.',
        'The confidence gained from travel prepares students for future challenges better than staying in a classroom.',
      ],
    },
  },
];
