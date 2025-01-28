import TesimonialImage1 from '@/public/tm-1.jpeg';
import TesimonialImage2 from '@/public/tm-2.jpeg';
import TesimonialImage3 from '@/public/tm-3.jpeg';
import { subDays } from 'date-fns';

export const navData = [
  {
    label: 'Overview',
    title: 'Welcome Back, ',
    description: 'This is your Financial Overview Report',
    href: '/overview',
  },
  {
    label: 'Accounts',
    title: 'All Your Accounts in One Place',
    description:
      'Add and manage your bank accounts, credit cards, and other financial sources seamlessly.',
    href: '/accounts',
  },
  {
    label: 'Bills',
    title: 'Track your Bill in One Place',
    description: 'Add and manage your bills, set reminders, and track payments.',
    href: '/bills',
  },
  {
    label: 'Transaction',
    title: 'Manage Your Transactions',
    description: 'Track, edit, and view all your income and expense transactions in one place.',
    href: '/transactions',
  },

  {
    label: 'Categories',
    title: 'Organize Your Finances',
    description:
      'Create and customize categories to organize and analyze your spending effectively.',
    href: '/categories',
  },
  {
    label: 'Settings',
    title: 'Personalize Your Experience',
    description:
      'Adjust preferences, manage your profile, and configure app settings to suit your needs.',
    href: '/settings',
  },
];

export const products = [
  {
    title: 'Account',
    link: `${process.env.NEXT_PUBLIC_APP_URl}/accounts`,
    thumbnail: 'https://aceternity.com/images/products/thumbnails/new/moonbeam.png',
  },
  {
    title: 'Transaction',
    link: `${process.env.NEXT_PUBLIC_APP_URl}/transactions`,
    thumbnail: 'https://aceternity.com/images/products/thumbnails/new/cursor.png',
  },
  {
    title: 'Bills',
    link: `${process.env.NEXT_PUBLIC_APP_URl}/bills`,
    thumbnail: 'https://aceternity.com/images/products/thumbnails/new/rogue.png',
  },

  {
    title: 'Profile',
    link: `${process.env.NEXT_PUBLIC_APP_URl}/settings`,
    thumbnail: 'https://aceternity.com/images/products/thumbnails/new/editorially.png',
  },
  {
    title: 'CSV',
    link: `${process.env.NEXT_PUBLIC_APP_URl}/transactions`,
    thumbnail: 'https://aceternity.com/images/products/thumbnails/new/editrix.png',
  },
  {
    title: 'Report',
    link: `${process.env.NEXT_PUBLIC_APP_URl}/overview`,
    thumbnail: 'https://aceternity.com/images/products/thumbnails/new/pixelperfect.png',
  },

  {
    title: 'Analytics',
    link: `${process.env.NEXT_PUBLIC_APP_URl}/overview`,
    thumbnail: 'https://aceternity.com/images/products/thumbnails/new/algochurn.png',
  },
  {
    title: 'Bank Connect',
    link: `${process.env.NEXT_PUBLIC_APP_URl}/settings`,
    thumbnail: 'https://aceternity.com/images/products/thumbnails/new/aceternityui.png',
  },
  {
    title: 'Subscription',
    link: `${process.env.NEXT_PUBLIC_APP_URl}/settings`,
    thumbnail: 'https://aceternity.com/images/products/thumbnails/new/tailwindmasterkit.png',
  },
  {
    title: 'Area Chart',
    link: `${process.env.NEXT_PUBLIC_APP_URl}/overview`,
    thumbnail: 'https://aceternity.com/images/products/thumbnails/new/smartbridge.png',
  },
  {
    title: 'Bar Chart',
    link: `${process.env.NEXT_PUBLIC_APP_URl}/overview`,
    thumbnail: 'https://aceternity.com/images/products/thumbnails/new/renderwork.png',
  },

  {
    title: 'Line Chart',
    link: `${process.env.NEXT_PUBLIC_APP_URl}/overview`,
    thumbnail: 'https://aceternity.com/images/products/thumbnails/new/cremedigital.png',
  },
  {
    title: 'Categories',
    link: `${process.env.NEXT_PUBLIC_APP_URl}/categories`,
    thumbnail: 'https://aceternity.com/images/products/thumbnails/new/goldenbellsacademy.png',
  },
  {
    title: 'Budget',
    link: `${process.env.NEXT_PUBLIC_APP_URl}/categories`,
    thumbnail: 'https://aceternity.com/images/products/thumbnails/new/invoker.png',
  },
  {
    title: 'E Free Invoice',
    link: `${process.env.NEXT_PUBLIC_APP_URl}/settings`,
    thumbnail: 'https://aceternity.com/images/products/thumbnails/new/efreeinvoice.png',
  },
];

export const MAX_FREE_ACCOUNT = 3;
export const MAX_FREE_TRANSACTIONS = 50;
export const MAX_FREE_CATEGORY = 5;
export const MAX_FREE_BILLS = 10;

export const MAX_PRO_ACCOUNT = 25;
export const MAX_PRO_CATEGORY = 100;

export const LAST_30_DAYS = 30;

export const pricingPlans = [
  {
    name: 'Free Plan',
    code: 'free',
    price: '₹0/month',
    description: 'Perfect for individuals starting to manage their finances.',
    features: [
      'Create up to 3 accounts',
      'Create up to 5 categories',
      'Add up to 50 transactions',
      'Basic analytics for monthly expenses',
    ],
    cta: 'Get Started',
    href: '/overview',
  },
  {
    name: 'Pro Plan',
    code: 'pro',
    description: 'Designed for users who need unlimited access to manage their finances.',
    features: [
      'create up to 25 account ',
      'create up to 100 categories ',
      'Connect up to 3 bank accounts',
      'Unlimited transactions',
      'Advanced analytics with visual reports',
    ],
    cta: 'Upgrade Now',
    productId: 414489,
    price: '₹699/month',
    variants: [
      {
        id: 634427,
        name: 'Go Pro Monthly – Flexibility at ₹699!',
        price: '₹699/month',
        period: 'Monthly',
      },
      {
        id: 634433,
        name: 'Go Pro Annually – Save Big at ₹6,999!',
        price: '₹6990/year',
        period: 'Annual',
      },
    ],
  },
  {
    name: 'Unlimited Plan',
    code: 'unlimited',
    description: 'Tailored for businesses and advanced users with specific requirements.',
    features: [
      'Unlimited Account creation',
      'Unlimited categories creation',
      'Unlimited transactions',
      'Connect up to 10 bank accounts',
      'Upload CSV data',
      'Get Personalise Summary Report',
      'Advanced analytics with visual reports',
      'Priority customer support',
    ],
    cta: 'Upgrade Now',
    productId: 417668,
    price: '₹999/month',
    variants: [
      {
        id: 639871,
        name: 'Unlimited-SAAS Monthly – All Features, No Limits',
        price: '₹999/month',
        period: 'Monthly',
      },
      {
        id: 639905,
        name: 'Unlimited-SAAS Annually – Save More, Achieve More',
        price: '₹9990/year',
        period: 'Annual',
      },
    ],
  },
];

export const variantPlan = [
  {
    variant: {
      id: 634427,
      name: 'Go Pro Monthly – Flexibility at ₹699!',
      price: '₹699/month',
      period: 'Monthly',
    },
    features: [
      'create up to 25 account ',
      'create up to 100 categories ',
      'Unlimited transactions',
      'Export CSV files',
      'Advanced analytics with visual reports',
    ],
  },
  {
    variant: {
      id: 634433,
      name: 'Go Pro Annually – Save Big at ₹6,999!',
      price: '₹6990/year',
      period: 'Annual',
    },
    features: [
      'create up to 25 account ',
      'create up to 100 categories ',
      'Unlimited transactions',
      'Export CSV files',
      'Advanced analytics with visual reports',
    ],
  },
  {
    variant: {
      id: 639871,
      name: 'Unlimited-SAAS Monthly – All Features, No Limits',
      price: '₹999/month',
      period: 'Monthly',
    },
    features: [
      'Unlimited Account creation',
      'Unlimited categories creation',
      'Unlimited transactions',
      'Upload and Export CSV data',
      'Advanced analytics with visual reports',
      'Priority customer support',
    ],
  },
  {
    variant: {
      id: 639905,
      name: 'Unlimited-SAAS Annually – Save More, Achieve More',
      price: '₹9990/year',
      period: 'Annual',
    },
    features: [
      'Unlimited Account creation',
      'Unlimited categories creation',
      'Unlimited transactions',
      'Upload and Export CSV data',
      'Advanced analytics with visual reports',
      'Priority customer support',
    ],
  },
];

export const testimonialsData = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    feedback:
      'This app completely transformed how I manage my finances. The analytics are insightful, and the ability to categorize expenses is a game-changer. Highly recommend it!',
    imageUrl: TesimonialImage1,
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    feedback:
      'I’ve tried many finance apps, but this one stands out. It’s intuitive, secure, and helps me stay on top of my transactions. A must-have for anyone serious about budgeting!',
    imageUrl: TesimonialImage2,
  },
  {
    name: 'Michael Lee',
    email: 'michael.lee@example.com',
    feedback:
      'The unlimited account creation feature is exactly what I needed. Now I can manage my personal and business finances in one app. Amazing work!',
    imageUrl: TesimonialImage3,
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    feedback:
      'The detailed analytics and seamless transaction tracking have made budgeting so much easier for me. I love how user-friendly this app is!',
    imageUrl: TesimonialImage1,
  },
  {
    name: 'David Kim',
    email: 'david.kim@example.com',
    feedback:
      'This app has everything I need to manage my finances efficiently. The customer support team is also incredibly responsive and helpful!',
    imageUrl: TesimonialImage2,
  },
];
const currentDate = new Date();

export const filterButton = [
  {
    label: 'last 7 days',
    from: subDays(currentDate, 7),
    to: currentDate,
  },
  {
    label: 'last 3 months',
    from: subDays(currentDate, 90),
    to: currentDate,
  },
  {
    label: 'last 6 months',
    from: subDays(currentDate, 180),
    to: currentDate,
  },
  {
    label: 'last 12 months',
    from: subDays(currentDate, 365),
    to: currentDate,
  },
  {
    label: 'last 5 years',
    from: subDays(currentDate, 365 * 5),
    to: currentDate,
  },
];

export const ReportDescriptions = {
  overview:
    'This report provides a detailed overview of financial metrics, including income, expenses, and trends over the selected period.',
  summaryDesc: `Total Income: The sum of all earnings during the reporting period. \n Total Expenses: The sum of all expenditures during the reporting period. \n Remaining Amount: The net balance after subtracting expenses from income. \n Income/Expenses/Remaining Change: Percentage changes compared to the previous period.`,
  topIncomeCatDescription:
    'Lists the highest-earning categories, ordered by the amount received during the reporting period.',
  topExpenseCatDescription:
    'Displays the categories with the highest expenses, showcasing where the majority of funds were spent.',
  topIncomeTransDescription:
    ' Details specific income transactions, including date, amount, and payee, sorted by amount.',
  topExpenseTransDescription:
    'Highlights notable expense transactions, showing details like date, amount, and payee.',
  categoryBudgetDescription:
    'Summarizes income and expenses for each category against predefined budgets, helping track budget adherence.',
  billsDescription:
    'Description: Lists pending bills with details like name, amount, due date, and payment status.',
  trendsDescription: 'Displays income and expense trends broken down by:',
  dayTrend: 'Daily financial movements.',
  weekTrend: 'Weekly income and expense aggregation.',
  monthTrend: 'Monthly income and expense patterns.',
  yearTrend: 'Yearly financial performance overview.',
};

export const getTrendDescription = (trend: 'day' | 'week' | 'month' | 'year') => {
  switch (trend) {
    case 'day':
      return ReportDescriptions.dayTrend;
    case 'week':
      return ReportDescriptions.weekTrend;
    case 'month':
      return ReportDescriptions.monthTrend;
    case 'year':
      return ReportDescriptions.yearTrend;
    default:
      return '';
  }
};
