'use client';
import { NextPage } from 'next';
import { ContainerScroll } from './_components/hero';
import Image from 'next/image';
import { HeroParallax } from './_components/product';
import { products, testimonialsData } from '@/lib/const';
import { LampContainer } from './_components/lamp';
import { motion } from 'framer-motion';
import { SparklesCore } from './_components/sparkle';
import { InfiniteMovingCards } from './_components/infinite-moving-card';
import { Vortex } from './_components/vortex-chemical';
import TopNavigation from './_components/top-navigation';
import PricingCards from './_components/pricing-cards';
import Link from 'next/link';

const Page: NextPage = () => {
  return (
    <section className="relative min-h-screen bg-black h-full w-full">
      <div className="absolute h-[1000px] left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:28px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <TopNavigation />
      {/* hero */}
      <div className="flex flex-col bg-black  overflow-hidden">
        <ContainerScroll
          titleComponent={
            <>
              <Link
                href={'/overview'}
                className="inline-flex h-12  animate-shimmer items-center justify-center rounded-full mb-2 border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
              >
                Get Started ✨
              </Link>
              <h1 className="text-4xl font-semibold text-white">
                Manage Your Expense With <br />
                <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                  Cashflow cloud
                </span>
              </h1>
            </>
          }
        >
          <Image
            src={`/hero.png`}
            priority
            alt="hero"
            height={720}
            width={1400}
            className="mx-auto rounded-2xl  object-cover h-full object-left-top"
            draggable={false}
          />
        </ContainerScroll>
      </div>
      <HeroParallax products={products} />

      {/* plans  */}
      <LampContainer>
        <motion.div
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: 'easeInOut',
          }}
        >
          <PricingCards />
        </motion.div>
      </LampContainer>

      {/* testimonials  */}
      <div className="h-[20rem] md:h-[30rem] w-ful bg-black  flex flex-col items-center justify-end overflow-hidden rounded-md">
        <h1 className="md:text-7xl text-3xl lg:text-9xl font-bold text-center text-white relative z-20">
          Our Client
        </h1>
        <div className="w-[40rem] h-40 relative">
          {/* Gradients */}
          <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
          <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
          <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
          <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

          {/* Core component */}
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={1200}
            className="w-full h-full"
            particleColor="#fff"
          />

          {/* Radial Gradient to prevent sharp edges */}
          <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
        </div>
      </div>

      <div className="h-[30rem] rounded-md flex flex-col antialiased bg-black dark:bg-grid-white/[0.05] items-center relative overflow-hidden">
        <InfiniteMovingCards items={testimonialsData} direction="right" speed="slow" />
      </div>

      {/* final words  */}
      <div className="w-full  h-[30rem] overflow-hidden">
        <Vortex
          backgroundColor="black"
          className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
        >
          <h2 className="text-white text-2xl md:text-6xl font-bold text-center">
            Your Money, Your Rules
          </h2>
          <p className="text-white text-sm md:text-2xl max-w-xl mt-6 text-center">
            Take control of your finances with advanced tools to manage accounts, transactions, and
            spending trends. Empower your financial freedom today!
          </p>
        </Vortex>
      </div>
    </section>
  );
};

export default Page;
