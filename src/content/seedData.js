/**
 * seedData.js - Initial training content
 *
 * Extracted and refined from Chance's HVAC sales training (recorded session).
 * All content is editable by admins through the app or by editing this file.
 *
 * Key principle: we present Chance's proven techniques but with accuracy guardrails.
 * Sales analogies are preserved (diesel vs Prius, 300K mile car). Fake-precise
 * efficiency percentages are NOT included in written materials.
 */

/* ── Objection Library ────────────────────────────────────────────── */

export const seedObjections = [
  {
    objection_text: "It still works fine, I'll just wait till it breaks.",
    category: "Timing",
    stage: "Presentation",
    rebuttal_script:
      "I totally get that. Your car still runs at 300,000 miles too, but you wouldn't drive it across the country, would you? The question isn't whether it works today. It's whether you want to replace it on YOUR schedule, or on the schedule of a 100-degree day in August when every HVAC company in the city is booked solid for a week.",
    example_responses: [
      "You probably don't change your oil after the engine blows up either, right? Same principle here.",
      "I'm not here because your system's broken. I'm here because I'd rather help you replace it on your terms than have you scrambling in July.",
      "Think about it like this: the best time to replace a system is before it becomes an emergency. That's literally why I knocked on your door today.",
    ],
    best_practices: [
      "Never argue that it IS broken. Agree it works, then shift to risk.",
      "Use the car analogy - everyone understands preventative maintenance.",
      "Point to what you found during inspection (rust, water, age) as evidence.",
      "If it's a husband, mention his wife/kids being without AC for a week.",
    ],
    difficulty: "Medium",
    frequency: "Very Common",
    tags: ["preventative", "urgency", "car analogy"],
  },
  {
    objection_text: "I can find it cheaper somewhere else.",
    category: "Price",
    stage: "Close",
    rebuttal_script:
      "You absolutely can. And if you want to write a check or swipe a credit card, I can definitely get you a cheaper price too. But let me ask you something: when you buy a car, do you pay the cash price, or do you finance it and pay a little more over time? Most people finance because they'd rather keep their cash. That's exactly what this is. The question isn't whether you can find a cheaper cash price. It's whether you want to spend $15,000 today, or $200 a month.",
    example_responses: [
      "Are you prepared to pay $15,000 cash today? Because if so, we can absolutely talk cash price. But most homeowners prefer to keep their money and pay monthly.",
      "I agree with you 100%. You CAN find it cheaper. If you're paying cash. The question is: are you paying cash?",
      "Finding it cheaper means paying cash upfront. Our program exists because most people can't or don't want to drop $15K at once.",
    ],
    best_practices: [
      "AGREE with them immediately. 'You absolutely can.' Disarms the objection.",
      "Use the car financing analogy - it's universal.",
      "Pivot quickly to the monthly payment conversation.",
      "Don't get defensive about price. You're selling financing, not equipment.",
    ],
    difficulty: "Hard",
    frequency: "Common",
    tags: ["price", "financing", "cash vs finance"],
  },
  {
    objection_text: "My electric bill is already pretty low.",
    category: "Price",
    stage: "Presentation",
    rebuttal_script:
      "That's great, but think about it like a diesel truck. If your truck only costs $15 to fill up because it's diesel, that's awesome, but you're still only getting 10 miles to the gallon. The efficiency is still terrible. Your bill might be low, but you're still burning way more electricity than you need to. A new system would make it even lower. And we both know this system needs to be replaced regardless.",
    example_responses: [
      "Cool, your bill is low. It'd be even cooler if we could get it lower. But either way, we both know this unit needs replacing.",
      "Low bill doesn't mean efficient system. It means you're lucky on rates. The unit is still costing you more than it should.",
    ],
    best_practices: [
      "Don't get bogged down in utility math at the door.",
      "Acknowledge their point, then redirect to the real issue: the unit is old and needs replacing.",
      "Use the diesel truck analogy - it's memorable and shuts down the debate.",
    ],
    difficulty: "Medium",
    frequency: "Common",
    tags: ["efficiency", "utility bills", "diesel analogy"],
  },
  {
    objection_text: "It's too expensive, I can't afford it.",
    category: "Price",
    stage: "Close",
    rebuttal_script:
      "Most people can't afford $15,000 out of pocket. That's exactly why this program exists. Most homeowners are afraid of replacements because they assume it's going to cost a fortune. What we've done is made it so ownership is never more than $200-300 a month. And when you factor in the savings on your utility bills from a modern, efficient system, the real out-of-pocket cost is even lower than that.",
    example_responses: [
      "I'm not asking you for $15,000. I'm asking you for about $200 a month. And that's before we factor in your utility savings.",
      "The reason most people haven't replaced their system is they think it costs a fortune. That's why we built this program - to make it affordable.",
    ],
    best_practices: [
      "Shift from total cost to monthly payment IMMEDIATELY.",
      "Normalize: 'Most people can't afford $15K. That's why this exists.'",
      "Bring in utility savings to show NET cost, not gross payment.",
      "Use the $100 net-cost framing from the financing module.",
    ],
    difficulty: "Hard",
    frequency: "Very Common",
    tags: ["affordability", "monthly payment", "financing"],
  },
  {
    objection_text: "I need to talk to my spouse / partner first.",
    category: "Decision Maker",
    stage: "Close",
    rebuttal_script:
      "Absolutely, that makes total sense. Is there a good time for both of you to be here? I can come back tonight or this weekend. The reason I ask is that the program and pricing I can offer today might not be available next week, and I'd hate for you to miss out on it. What works better for them, this evening or this weekend?",
    example_responses: [
      "Totally understand. Is your spouse around in the evenings? I can come back tonight and walk you both through it together.",
      "Makes sense. But let me ask - what do YOU think? If it were just your decision today, does this make sense to you?",
      "I get it. But here's the thing: the financing terms I can lock in today are better than what'll be available next week. Can we get them on the phone real quick?",
    ],
    best_practices: [
      "Always agree first. Never fight the spouse objection.",
      "Try to get them on the phone right then if possible.",
      "Offer specific time options for a return visit (tonight or Saturday).",
      "Trial close: 'If it were just your decision, does this make sense?'",
      "If spouse is home, ALWAYS get both decision makers at the table.",
    ],
    difficulty: "Medium",
    frequency: "Very Common",
    tags: ["spouse", "decision maker", "follow-up"],
  },
  {
    objection_text: "I don't finance things. I don't like debt on my credit.",
    category: "Price",
    stage: "Close",
    rebuttal_script:
      "I respect that. A lot of people feel the same way. That's actually why we have the membership option, which is a lease, not a loan. It doesn't go on your credit unless you don't pay. So you get all the benefits of a new system without taking on debt. Would you want to hear about how that works?",
    example_responses: [
      "Makes total sense. The cool part about our membership is that it's a lease, not financing. It doesn't hit your credit.",
      "I get it. Nobody likes debt. That's why we have two paths: ownership financing or a lease membership. The lease doesn't show up on your credit at all.",
    ],
    best_practices: [
      "Don't push the loan if they're resistant. Pivot to the lease/membership.",
      "Frame the lease as the 'smart' option, not the 'cheap' option.",
      "Either way - ownership or membership - you win.",
    ],
    difficulty: "Medium",
    frequency: "Common",
    tags: ["financing", "lease", "credit", "membership"],
  },
  {
    objection_text: "The interest rate on the loan is too high (11%).",
    category: "Price",
    stage: "Close",
    rebuttal_script:
      "I hear you. The average home improvement loan runs anywhere from 9 to 15%. That's just the reality of home improvement financing. But here's what matters: most HVAC companies spread their financing over 5 years, which means your payment is $800-1000 a month. We spread ours over a longer term so your payment is $200-300. If you want to pay it off faster and avoid the interest, you absolutely can. But the low monthly payment is what makes this doable for most families.",
    example_responses: [
      "You're right, and most home improvement loans are in that range. But the difference is our payment is $200, not $900. You can pay it off early if you want to skip the interest.",
      "Yeah, interest on home improvement loans isn't great anywhere. But would you rather pay $900/month for 5 years, or $200/month and have the option to pay it off early?",
    ],
    best_practices: [
      "Validate the concern - don't pretend 11% is great.",
      "Compare to the industry standard ($800-1000/month on shorter terms).",
      "Emphasize flexibility: pay it off early to avoid interest.",
      "The low payment is the hook, not the interest rate.",
    ],
    difficulty: "Hard",
    frequency: "Occasional",
    tags: ["interest rate", "financing", "payment term"],
  },
  {
    objection_text: "I already have an HVAC guy / company I use.",
    category: "Competition",
    stage: "Door Approach",
    rebuttal_script:
      "That's great, it's smart to have someone you trust. Quick question though: when was the last time they offered you financing to replace your system BEFORE it breaks? Most HVAC companies wait until your system dies, then hand you a $15,000 bill. We do the opposite: we help you replace it on your schedule with a payment that makes sense. Can I at least take a look at your unit and tell you where it stands?",
    example_responses: [
      "Awesome, keep using them for maintenance. But do they offer financing on replacements? Because that's what we do differently.",
      "Most HVAC companies are reactive. They wait for it to break. We're proactive. Different service entirely.",
      "I'm not trying to replace your guy. I'm offering something he probably doesn't: affordable replacement financing before it becomes an emergency.",
    ],
    best_practices: [
      "Never bash the competitor. Respect the existing relationship.",
      "Highlight the key differentiator: proactive financing vs reactive repairs.",
      "Offer a free inspection - low commitment, gets you in the door.",
    ],
    difficulty: "Medium",
    frequency: "Common",
    tags: ["competition", "differentiation", "financing"],
  },
  {
    objection_text: "What if I'm moving / selling the house soon?",
    category: "Timing",
    stage: "Presentation",
    rebuttal_script:
      "That's actually even more reason to do this now. A new HVAC system increases your home value and is a major selling point. Buyers love seeing a new system with a transferable warranty or lease. Plus, if the system dies while you're trying to sell, that's a deal-killer. Replacing it now protects your sale price.",
    example_responses: [
      "A new HVAC system is one of the top things buyers look for. It can actually increase your sale price.",
      "If your system dies during a showing or inspection period, that can kill the deal. This protects you.",
      "The lease/membership is transferable to the new owner, which makes your home more attractive.",
    ],
    best_practices: [
      "Frame it as protecting the sale, not spending money.",
      "Mention home value increase and buyer appeal.",
      "If using lease, note it's transferable.",
    ],
    difficulty: "Easy",
    frequency: "Occasional",
    tags: ["moving", "home sale", "home value"],
  },
];

/* ── Training Modules ─────────────────────────────────────────────── */

export const seedModules = [
  {
    title: "The HVAC Opportunity",
    description:
      "Why this market is wide open. Understand the industry, the competition, and why door-to-door HVAC is a first-of-its-kind opportunity.",
    category: "Onboarding",
    stage: "Orientation",
    difficulty: "Intro",
    estimated_minutes: 15,
    learning_objectives: [
      "Explain why HVAC is different from solar door-to-door",
      "Describe the reactive vs proactive sales model",
      "Articulate the financing gap in the HVAC industry",
      "Understand why no one has done this at scale before",
    ],
    is_required: true,
    certification_level: "Level 1",
    order: 1,
    content: `# The HVAC Opportunity

## Why This Market Is Wide Open

Every home has HVAC. Just like every home has a car in the driveway. But unlike cars, HVAC systems are sold reactively: they break, the homeowner panics, and they pay whatever the emergency repair company charges.

**The current HVAC industry model:**
- System breaks (usually on the hottest or coldest day of the year)
- Homeowner calls in a panic
- Company knows they're desperate
- Customer pays $15,000-25,000 cash or credit card
- No financing options, no proactive replacement

**Our model:**
- We knock BEFORE the system dies
- We offer inspection and education
- We present affordable financing (lease or ownership)
- We replace on the homeowner's schedule, not in an emergency

## Why Financing Changes Everything

95% of HVAC companies charge cash, check, or credit card. That's it. No financing programs. No leases. No monthly payment options.

When the only option is "$18,000 today," most homeowners band-aid their aging system with $2,000-3,000 repairs. They keep throwing money at a dying system because the alternative feels impossible.

We solve that. By offering a $200-300/month payment, we make replacement accessible to families who could never afford $15,000 upfront.

## What This Means For You

You're not selling HVAC equipment. You're selling:
- Peace of mind (no more worrying about breakdowns)
- Lower utility bills (modern systems are far more efficient)
- Affordable payments (financing that no one else offers)
- Control (replacing on their schedule, not in an emergency)

This is a blue ocean. No one is knocking doors for HVAC at scale. You're first.`,
  },
  {
    title: "Your Identity: Contractor, Not Salesman",
    description:
      "How to position yourself at the door and throughout the sale. The critical difference between being an HVAC tech and being an electrical contractor who inspects.",
    category: "Onboarding",
    stage: "Orientation",
    difficulty: "Intro",
    estimated_minutes: 10,
    learning_objectives: [
      "Position yourself as an electrical contractor, not an HVAC salesman",
      "Handle technical questions without faking expertise",
      "Understand why honesty about your role builds trust",
      "Use your iPad/computer as your authority, not your knowledge",
    ],
    is_required: true,
    certification_level: "Level 1",
    order: 2,
    content: `# Your Identity: Contractor, Not Salesman

## The #1 Rule

**You are NOT an HVAC technician.**

Don't try to memorize refrigerant types, blower motors, or static pressure. Your job is to discover problems and present solutions.

## Your Positioning

When someone asks what you do:

> "I'm one of the electrical contractors working with homeowners to identify aging heating and cooling systems before they become emergencies."

Notice what happened. You became a consultant, not a salesman.

## Handling Technical Questions

Homeowners will ask technical questions. Contractors will test you. Here's your playbook:

> "That's a great question. I don't want to tell you something inaccurate. My specialty is documenting the system correctly. Our certified HVAC specialists verify every technical detail before anything moves forward."

Or:

> "I focus on the electrical side. We have certified guys on the crew for the technical HVAC work. My job today is simple: take pictures, document the system, and get it to our team for approval."

## Why This Works

1. **It's honest.** Customers trust honesty more than fake expertise.
2. **It removes pressure.** You don't need to know everything.
3. **It builds authority.** "I document and our team verifies" sounds professional.
4. **It handles contractors.** Real HVAC guys respect someone who admits what they don't know.

## Your iPad Is Your Authority

When you take pictures, enter data, and "submit to the team," you look like a professional with a process. That's more convincing than someone who memorized technical specs.

## The Old HVAC Tech Stereotype

Remember: the current HVAC industry is guys who show up with dip in their lip, a hot dog stain on their shirt, and they're on the phone with tech support trying to figure out the repair. You don't need to compete with that on technical knowledge. You compete on professionalism, process, and financing.`,
  },
  {
    title: "Dress Code: Look Capable, Not Corporate",
    description:
      "What to wear and what NOT to wear. You want to look like someone who works on homes, not a golf-course salesman.",
    category: "Onboarding",
    stage: "Orientation",
    difficulty: "Intro",
    estimated_minutes: 5,
    learning_objectives: [
      "Choose the right attire for HVAC door-to-door",
      "Understand why overdressing kills deals",
      "Match the 'capable worker' aesthetic",
    ],
    is_required: true,
    certification_level: "Level 1",
    order: 3,
    content: `# Dress Code: Look Capable, Not Corporate

## The Sweet Spot

You want to be somewhere between:
- **Too professional** (polo, golf shorts, Nike Air Max) = "This guy's a salesman, not a worker"
- **Too sloppy** (stained shirt, dip in lip) = "This guy doesn't know what he's doing"

## What To Wear

- 511 tactical pants or durable work pants
- Good boots (you'll be in crawl spaces and basements)
- A button-up collared work shirt (clearly a work shirt, not a polo)
- Clean, functional, professional

## What NOT To Wear

- Golf shorts and a polo
- Lululemon joggers
- White sneakers that'll get ruined
- Anything that says "I've never crawled under a house"

## Why This Matters

When you knock on a door, the homeowner makes a split-second judgment. If you look like a corporate salesman, they're already defensive. If you look like someone who actually works on homes and might need to crawl under their house, they're more open.

**Look good, feel good, sell good.** But not TOO good.`,
  },
  {
    title: "The Door Approach",
    description:
      "Chance's proven door approach. Super direct, confident, and designed to get you to the unit in under 60 seconds.",
    category: "Core Skills",
    stage: "Prospecting",
    difficulty: "Intermediate",
    estimated_minutes: 20,
    learning_objectives: [
      "Deliver the door approach script from memory",
      "Handle the initial response (yes, no, or questions)",
      "Transition smoothly to the inspection",
      "Use directional questions to build momentum",
    ],
    is_required: true,
    certification_level: "Level 1",
    order: 4,
    content: `# The Door Approach

## The Script

This is super direct. It seems too simple to work. It works because it's confident.

> "Hey, I'm [Name]. We're electrical contractors. We've been working with some of your neighbors. We specialize in heating and air. I just got done talking with Mr. [Neighbor Name], and what he found is that his system was super old, and there's already some programs where it made it as close to free as humanly possible. So we're out here just offering free inspections for his neighbors real quick. Is your unit on the back left or right?"

**Then you wait.**

## The Psychology

1. **"Electrical contractors"** - Not "HVAC salesman." Lowers defenses.
2. **"Working with your neighbors"** - Social proof, builds curiosity.
3. **"Free inspection"** - Zero commitment, low friction.
4. **"Left or right?"** - A directional question. People answer automatically. It's easier to process than a yes/no question. Creates momentum toward compliance.
5. **Silence** - First person to talk loses. Let them answer.

## Handling Responses

**"Yeah, it's on the left" (50-60% of the time)**
- Walk to the unit. They usually follow.
- Start taking pictures immediately.

**"No, I just replaced it" (5% of the time)**
- "Oh, okay. You know why we're out here then. Have a good day."
- Move on. These doors filter themselves.

**Hesitation / questions**
- Answer confidently, keep it brief.
- Redirect to the inspection: "It'll take 2 minutes."

## Critical Rules

- **Firm handshake, eye contact.** Not too hard, but confident.
- **Don't oversell at the door.** The goal is to get to the unit. The inspection sells, not the door pitch.
- **Never say "solar."** You're electrical contractors. Period.
- **Move with purpose.** Once they say yes, walk like you know exactly where you're going.`,
  },
  {
    title: "The Inspection: Finding The Pain",
    description:
      "The most important part of the sale. How to inspect the unit, photograph damage, and build the emotional case before you ever sit down.",
    category: "Core Skills",
    stage: "Qualifying",
    difficulty: "Master",
    estimated_minutes: 25,
    learning_objectives: [
      "Inspect the outdoor condenser unit systematically",
      "Transition to the indoor furnace/air handler",
      "Document signs of wear: rust, water, droppings, corrosion",
      "Build pain with every discovery using proven phrases",
      "Leave the furnace open as an assumptive close technique",
    ],
    is_required: true,
    certification_level: "Level 2",
    order: 5,
    content: `# The Inspection: Finding The Pain

## The Most Important Part

Most reps think the kitchen table closes the deal. Wrong.

**The inspection closes the deal.**

Every picture, every rust spot, every water stain, every old serial number, every mouse dropping builds the emotional case. By the time you sit down, the sale has already begun.

## Step 1: The Outdoor Unit

1. **Take pictures immediately.** Model number, serial number.
2. **Step back and observe.** "Wow, this unit's pretty old."
3. **Drop the efficiency seed.** "It's like a big diesel motor on the side of your house."
4. **Ask the transition question:** "Do you have the matching unit on the inside?"
   - 75% of people don't know. They say "I don't know."
   - You say: "I just need to see it real quick."
   - They take you right to it.

## Step 2: The Indoor Unit (Furnace/Air Handler)

### Opening the Furnace
- Carrier systems: twist the two nozzles on each side, pull up and out.
- Rheem systems: screws in the middle, unscrew.
- Others: look for a handle, or use a screwdriver.
- The front panel comes off. Use your brain.

### Finding the Serial Number
- Usually on a panel inside the furnace (left or right side).
- 95% of the time it's there. Take a picture.

## Step 3: Building The Pain

**This is where the sale happens.**

When you open an old furnace, you'll typically find:

### Water / Condensation
> "You see that water? Such a good thing I stopped today. We both know water's not supposed to be in there. You see all this electronics? What do you think happens to wiring and motherboards when water gets on it? It's a good thing I stopped by."

### Rust / Corrosion
> "Sir, you have all this rust in here. Rust means water has been getting in. If that hits the motherboard, you're looking at a total system failure."

### Mouse / Animal Droppings
> "You've got mice in here. These wires are coated with soy, and mice love to eat them. You're going to wake up one day with no furnace."

### Burn Marks
> "See these burn marks? That's electrical arcing. This is a fire hazard."

## Step 4: The Assumptive Transition

**If you found damage, DON'T put the furnace back together.**

Set the panel to the side and say:

> "I'm going to leave this open so we can get it fixed. Where's somewhere I can sit so I can show you what I found?"

Notice: NOT "sell you something." NOT "talk business."

**"Where's somewhere I can sit so I can show you what I found?"**

This transitions to the kitchen table where you present the solution.

## Remember

The inspection sells because it's visual and physical. The homeowner SEES the problem. They're not being told their system is old. They're watching you discover it in real time.

That's why this is the most important part of the sale.`,
  },
  {
    title: "The Table Presentation",
    description:
      "How to present the solution at the kitchen table. Using the inspection findings to build urgency and transition to financing.",
    category: "Core Skills",
    stage: "Presentation",
    difficulty: "Intermediate",
    estimated_minutes: 20,
    learning_objectives: [
      "Present findings from the inspection",
      "Handle the 'it's not broken' objection proactively",
      "Transition to financing naturally",
      "Use the assumptive close",
    ],
    is_required: true,
    certification_level: "Level 2",
    order: 6,
    content: `# The Table Presentation

## Setting Up

At the kitchen table, pull out your iPad or phone. Open the inspection app.

Fill in: First name, last name, phone, email, address. Upload your pictures.

## The Opening

> "Mr. [Name], I'm so glad I stopped today. We both know it's not broken right now. Obviously, or this house would be super uncomfortable. I'm not here to insult your intelligence and tell you it's broken."

Pause.

> "I AM here to tell you that you need to get it done. Here's why:
> 1. It's super old.
> 2. We saw that damage when we opened up the furnace.
> 3. If your furnace goes down, the likelihood that your AC goes down doubles or triples."

## The Price Drop

> "Most people haven't replaced it because they think it's a ton of money, or that I'm going to ask for a card or a check."

Pause. Let them respond. They'll say something like:
- "Yeah, the last guy wanted $12,000."
- "My friend just did it and it was $15,000."

> "Yeah, that's why we have this program. Most people can't afford $15,000 out of their pocket. So what we did is we made it really easy and affordable. Ownership is never more than $200-300 a month."

## The Membership Pivot

Present the lease/membership option:

> "The cool part about our membership is that it's a lease, not financing. It doesn't go on your credit unless you don't pay."

If they say no to the membership, circle to ownership financing.

## The Assumptive Close

> "Good news is, I don't have the unit in my truck. I didn't come with the exact unit your house needs. But like I told you, I'm the electrical guy. We've got to get this submitted to our team to verify everything.

> Provided I can get all this done, and you don't have to pay me thousands of dollars, it's just a couple hundred bucks a month after we get it installed..."

> "...this would be a pretty easy decision, wouldn't it?"

**Then silence.** Let them answer. The real objection comes out here.`,
  },
  {
    title: "Financing: Selling Net Cost, Not Payment",
    description:
      "Chance's method for reframing the monthly payment. How to show homeowners the REAL cost after utility savings and incentives.",
    category: "Core Skills",
    stage: "Close",
    difficulty: "Master",
    estimated_minutes: 20,
    learning_objectives: [
      "Reframe $236/month as ~$100/month net cost",
      "Explain efficiency savings in simple terms",
      "Use the diesel-vs-Prius analogy",
      "Apply the rebate calculation",
      "Maintain accuracy: never guarantee specific savings",
    ],
    is_required: true,
    certification_level: "Level 2",
    order: 7,
    content: `# Financing: Selling Net Cost, Not Payment

## The Core Principle

Customers don't compare "$236 payment."

They compare: **"How much MORE is this actually costing me?"**

That's a completely different conversation.

## The Diesel vs Prius Analogy

This is your most powerful tool:

> "Your old system is like a big diesel truck running beside your house all day. Loud, expensive, burning fuel. We're replacing it with the equivalent of a Prius. Quiet, efficient, lower operating costs."

Everyone understands this. No HVAC knowledge required.

## Step-By-Step

### 1. Normalize
> "Most homeowners are afraid of replacing their HVAC because they assume it costs a fortune. That's exactly why this program exists."

### 2. Move to Utility Bills
> "Let me show you something on your utility bills."

Now you're talking about THEIR money, not your product.

### 3. Explain Efficiency (Simply)
> "Your system was efficient when it was new. But these systems lose efficiency over the years. After 15-20 years, you're spending more on electricity than you need to."

### 4. Estimate Savings
Ask for their gas and electric bills. Calculate approximately 30% potential savings on heating and cooling costs.

**Example:**
- Electric bill: $220/month
- Gas bill: $110/month
- Total: $330/month
- Estimated 30% savings: ~$99/month

### 5. Calculate Net Cost
- Monthly payment: $236
- Minus estimated utility savings: -$99
- = $137/month effective cost

### 6. Apply Rebate (if available)
If there's a $4,000 incentive:
- $4,000 / 240 months = ~$17/month
- $137 - $17 = ~$120/month

> "So when you look at it that way, this system is really only costing you about $100-120 a month out of pocket, because you're saving so much on utilities."

## Accuracy Guardrails

**DO say:**
- "Many homeowners see meaningful reductions in heating and cooling costs after upgrading."
- "Older systems are typically much less efficient than today's equipment."
- "The exact savings depend on your home, usage, and utility rates."

**DON'T say:**
- "You're at exactly 30% efficiency." (You don't know this.)
- "You'll save exactly $99/month." (You can't guarantee this.)
- "You're losing 3% efficiency per year." (This is an estimate, not a measured fact.)

**Use the story, not the fake math.** The diesel-vs-Prius analogy works because it's relatable, not because it's precise. Keep the calculation as a "rough estimate" that shows the concept.`,
  },
  {
    title: "HVAC Equipment Basics",
    description:
      "Sales-level product knowledge. Enough to sound knowledgeable without pretending to be a technician. Major brands, components, and terminology.",
    category: "Tools & Resources",
    stage: "Qualifying",
    difficulty: "Intermediate",
    estimated_minutes: 25,
    learning_objectives: [
      "Identify major HVAC brands on sight",
      "Understand basic components (condenser, furnace, coil, etc.)",
      "Explain SEER2 and efficiency ratings in simple terms",
      "Know enough to defer technical questions appropriately",
    ],
    is_required: false,
    certification_level: "Level 2",
    order: 8,
    content: `# HVAC Equipment Basics

## Sales-Level Knowledge Only

You don't need to be a technician. You need to know enough to:
1. Identify what you're looking at
2. Find the model and serial number
3. Spot obvious signs of age and wear
4. Sound credible without faking expertise

## The Two Main Components

### Outdoor Unit (Condenser)
- The big metal box outside
- Contains the compressor, condenser coil, and fan
- Runs on electricity
- Model/serial number usually on a sticker on the side or back

### Indoor Unit (Furnace / Air Handler)
- In the basement, attic, or closet
- Contains the heat exchanger (gas) or electric strips
- Also contains the blower motor and evaporator coil
- Model/serial number usually inside, behind the front panel

## Major Brands

| Brand | Notes |
|-------|-------|
| Carrier | Premium. Two twist nozzles on furnace panel. |
| Bryant | Made by Carrier. Similar quality. |
| Trane | Premium. Distinctive clamshell design. |
| American Standard | Made by Trane. |
| Lennox | Premium. proprietary parts, harder to service. |
| Rheem | Mid-tier. Screws on furnace panel. |
| Ruud | Made by Rheem. |
| Goodman | Budget. Very common in newer builds. |
| Amana | Made by Goodman. |
| York | Mid-tier. |
| Heil | Budget. Made by ICP. |
| Payne | Budget. Made by Carrier. |

## Efficiency Ratings (Simplified)

- **SEER2** = Cooling efficiency. Higher = better. Old systems: 8-10. New systems: 14-20+.
- **AFUE** = Heating efficiency (gas furnaces). Old: 65-80%. New: 95-98%.
- **HSPF2** = Heat pump heating efficiency.

**Don't memorize these.** Just know: old systems are inefficient, new systems are efficient. That's the sales message.

## Your Go-To Phrase

When asked anything technical:

> "I focus on the electrical side. Let me get pictures of the model and serial number and our certified team will verify the specifics."

## How to Age a System

1. **Serial number lookup.** Most manufacturers encode the year in the serial number. Different formats per brand.
2. **Physical signs.** Rust, faded labels, dirty coils, worn components.
3. **R-22 refrigerant.** If the system uses R-22 (Freon), it's pre-2010. R-22 is discontinued and expensive to recharge.

You'll get faster at this with experience. Don't stress about knowing the exact year. "This looks like it's been here a while" is fine.`,
  },
  {
    title: "Sales Psychology: Why People Buy",
    description:
      "The behavioral science behind HVAC purchases. Understanding fear, urgency, and decision-making to sell ethically and effectively.",
    category: "Core Skills",
    stage: "Presentation",
    difficulty: "Master",
    estimated_minutes: 20,
    learning_objectives: [
      "Understand the emotional drivers of HVAC purchases",
      "Use loss aversion ethically (fear of breakdown)",
      "Apply the principle of consistency (inspection to close)",
      "Use silence as a sales tool",
    ],
    is_required: false,
    certification_level: "Level 3",
    order: 9,
    content: `# Sales Psychology: Why People Buy

## People Don't Buy HVAC. They Buy Outcomes.

When a homeowner agrees to a $20,000 replacement, they're not buying equipment. They're buying:

- **Peace of mind** (no more worrying about breakdowns)
- **Comfort** (reliable heating and cooling)
- **Lower bills** (efficiency savings)
- **Predictability** (known monthly cost vs unpredictable repairs)
- **Control** (replacing on their schedule)

Always sell outcomes. Never sell equipment.

## The Two Emotional Drivers

### Fear of Loss (Loss Aversion)
Humans are wired to feel losses 2x more intensely than equivalent gains.

**Trigger:** "If your system goes out in August, you'll be without AC for a week in 100-degree heat."

**Ethical version:** You're not creating fake fear. The risk is real. Old systems DO break at the worst times. You're helping them see a risk they've been ignoring.

### Desire for Control
People hate feeling helpless. The current HVAC model makes homeowners feel helpless: they wait for the system to die, then pay whatever the emergency company charges.

**Trigger:** "Wouldn't you rather handle this on YOUR schedule, not when you're desperate?"

## The Principle of Consistency

Once a homeowner lets you inspect their unit, they've made a small commitment. Each step (walking to the unit, letting you inside, sitting at the table) is a micro-commitment.

By the time you present pricing, they've already invested time and attention. This creates psychological momentum. They're more likely to say yes because they've already been saying yes at each step.

**This is why the inspection matters more than the close.**

## Silence as a Sales Tool

After you ask a closing question: **STOP TALKING.**

Most reps panic and fill the silence, often talking themselves OUT of the sale. Let the homeowner think. Let them process. The silence feels uncomfortable to you, but to them, it's decision time.

**He who speaks first, loses.**

## The "I'm Glad I Stopped" Pattern

Every discovery during inspection gets the same response:

> "Good thing I stopped by today."

This pattern does three things:
1. Validates the problem (it's real, not invented)
2. Positions you as helpful (you found it, you care)
3. Builds urgency (if you hadn't stopped, they wouldn't know)

Repeat this phrase at every finding. It compounds.`,
  },
];

/* ── Seed Assignments (empty for now, coaches add them) ───────────── */

export const seedAssignments = [];
