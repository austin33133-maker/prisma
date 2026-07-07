import { Activity, ChatThread, UserProfile } from './types'

function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 3_600_000).toISOString()
}

export const ME: UserProfile = {
  id: 'me',
  name: 'Alex',
  age: 25,
  city: 'Singapore',
  bio: 'New in town. Always up for good food and badminton.',
  interests: ['Badminton', 'Ramen', 'Board games', 'Live music'],
  avatarColor: '#FF4F5E',
}

export const USERS: UserProfile[] = [
  ME,
  { id: 'u1', name: 'Mia', age: 24, city: 'Singapore', bio: 'Foodie, always hunting the next hawker gem.', interests: ['Food', 'Photography'], avatarColor: '#7C5CE7' },
  { id: 'u2', name: 'Ken', age: 27, city: 'Singapore', bio: 'Badminton twice a week, join me!', interests: ['Badminton', 'Hiking'], avatarColor: '#00B894' },
  { id: 'u3', name: 'Aisha', age: 23, city: 'Singapore', bio: 'Concerts, musicals, anything live.', interests: ['Music', 'Theatre'], avatarColor: '#0984E3' },
  { id: 'u4', name: 'Leo', age: 26, city: 'Singapore', bio: 'Board game host. Catan grandmaster (self-titled).', interests: ['Board games', 'Coffee'], avatarColor: '#E17055' },
  { id: 'u5', name: 'Nina', age: 25, city: 'Singapore', bio: 'Weekend hikes and brunch after.', interests: ['Hiking', 'Brunch'], avatarColor: '#D63031' },
]

export const ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    hostId: 'u1',
    category: 'food',
    title: 'Hawker crawl at Maxwell Centre',
    description: 'Hitting 4-5 stalls, splitting everything so we can try more. Come hungry!',
    place: 'Maxwell Food Centre',
    startsAt: hoursFromNow(5),
    maxMembers: 6,
    memberIds: ['u1', 'u3'],
    distanceKm: 1.2,
  },
  {
    id: 'a2',
    hostId: 'u2',
    category: 'sports',
    title: 'Badminton doubles, need 2 more',
    description: 'Intermediate level, court booked 7-9pm. Rackets available if you need one.',
    place: 'OCBC Arena Hall 2',
    startsAt: hoursFromNow(8),
    maxMembers: 4,
    memberIds: ['u2', 'u5'],
    distanceKm: 3.8,
  },
  {
    id: 'a3',
    hostId: 'u3',
    category: 'show',
    title: 'Indie gig at the Esplanade',
    description: 'Free outdoor set at 8pm. Grabbing drinks nearby after if the vibe is right.',
    place: 'Esplanade Outdoor Theatre',
    startsAt: hoursFromNow(30),
    maxMembers: 5,
    memberIds: ['u3'],
    distanceKm: 2.1,
  },
  {
    id: 'a4',
    hostId: 'u4',
    category: 'games',
    title: 'Board game night: Catan + Wingspan',
    description: 'Chill session at a board game cafe. Beginners totally welcome.',
    place: 'Mind Cafe, Prinsep St',
    startsAt: hoursFromNow(28),
    maxMembers: 6,
    memberIds: ['u4', 'u1', 'u5'],
    distanceKm: 0.9,
  },
  {
    id: 'a5',
    hostId: 'u5',
    category: 'sports',
    title: 'Sunrise hike: MacRitchie TreeTop Walk',
    description: 'Meet 6:30am at the entrance. ~2.5h loop, brunch after for whoever is free.',
    place: 'MacRitchie Reservoir',
    startsAt: hoursFromNow(50),
    maxMembers: 8,
    memberIds: ['u5', 'u2'],
    distanceKm: 6.4,
  },
]

export const THREADS: ChatThread[] = [
  {
    id: 't1',
    kind: 'direct',
    title: 'Mia',
    participantIds: ['me', 'u1'],
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Hey! Saw you joined the hawker crawl 🙌', sentAt: hoursFromNow(-3) },
      { id: 'm2', senderId: 'me', text: 'Yes! First time at Maxwell, any must-try stalls?', sentAt: hoursFromNow(-2.9) },
      { id: 'm3', senderId: 'u1', text: 'Tian Tian chicken rice, no debate. We queue early.', sentAt: hoursFromNow(-2.8) },
    ],
  },
  {
    id: 't2',
    kind: 'group',
    title: 'Hawker crawl at Maxwell Centre',
    activityId: 'a1',
    participantIds: ['me', 'u1', 'u3'],
    messages: [
      { id: 'm4', senderId: 'u1', text: 'Welcome everyone! Meeting at the Maxwell Rd entrance at 6pm.', sentAt: hoursFromNow(-1) },
      { id: 'm5', senderId: 'u3', text: 'Perfect, I might be 5 min late, save me a seat 😅', sentAt: hoursFromNow(-0.5) },
    ],
  },
]

export const AUTO_REPLIES = [
  'Sounds good! 👍',
  'Haha nice, see you there!',
  'Let me check and get back to you.',
  'Anyone else joining?',
  'Great, adding it to my calendar 📅',
]
