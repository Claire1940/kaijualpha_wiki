"use client";

import { useState, Suspense, lazy } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Flame,
  GraduationCap,
  KeyRound,
  MapPin,
  Newspaper,
  Rocket,
  Sparkles,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  // moduleLinkMap 保留以兼容 page.tsx 调用方；首页模块标题不再渲染内部文章链接。
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

// Tools Grid 导航卡片 → 模块 section id 一一对应
const TOOL_SECTION_IDS = [
  "beginner-guide",
  "tier-list",
  "kaiju-abilities",
  "leveling-cell-farming",
  "controls-and-combat-guide",
  "unlock-requirements",
  "limit-break-and-upgrades",
  "updates-and-new-kaiju",
];

export default function HomePageClient({
  latestArticles,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://kaijualpha.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Kaiju Alpha Wiki",
        description:
          "Complete Kaiju Alpha Wiki covering tier lists, kaiju abilities, U-cell farming, controls, unlock guides, and update notes for the Roblox monster PvP battleground by SULU KAKA.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Kaiju Alpha - Giant Monster PvP Battleground",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Kaiju Alpha Wiki",
        alternateName: "Kaiju Alpha",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Kaiju Alpha Wiki - Giant Monster PvP Battleground",
        },
        sameAs: [
          "https://www.roblox.com/games/139769003880269/Kaiju-Alpha",
          "https://www.reddit.com/r/GODZILLA/",
          "https://www.youtube.com/watch?v=dLyMYKGxBzI",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Kaiju Alpha",
        gamePlatform: ["PC", "Mac", "Mobile", "Roblox"],
        applicationCategory: "Game",
        genre: ["Action", "Fighting", "Battlegrounds", "PvP"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 30,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://www.roblox.com/games/139769003880269/Kaiju-Alpha",
        },
      },
      {
        "@type": "VideoObject",
        name: "MONSTER X SHOWCASE! (NEW UPDATE) - Roblox Kaiju Alpha",
        description:
          "Monster X showcase and update gameplay for Kaiju Alpha, the Roblox kaiju PvP battleground by SULU KAKA.",
        uploadDate: "2026-03-12",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/dLyMYKGxBzI",
        url: "https://www.youtube.com/watch?v=dLyMYKGxBzI",
      },
    ],
  };

  // 解锁要求 accordion 状态
  const [unlockExpanded, setUnlockExpanded] = useState<number | null>(0);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  // 复用：模块标题（图标 + 文本，纯文本无内部链接）
  const ModuleHeading = ({
    icon: Icon,
    children,
  }: {
    icon: any;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-center gap-3 mb-4">
      <Icon className="w-8 h-8 text-[hsl(var(--nav-theme-light))]" />
      <h2 className="text-3xl md:text-5xl font-bold text-center">{children}</h2>
    </div>
  );

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("beginner-guide")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/games/139769003880269/Kaiju-Alpha"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section - 紧跟 Hero 区域（容器上限 max-w-5xl，避免挤压广告） */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="dLyMYKGxBzI"
              title="MONSTER X SHOWCASE - Roblox Kaiju Alpha"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards（位于视频区之后、Latest Updates 之前） */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = TOOL_SECTION_IDS[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Updates Section（content/ 为空时组件返回 null，无空态残留） */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* 广告位 2: Tools Grid / Latest Updates 之后的原生横幅 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端方形 + 桌面端横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Beginner Guide */}
      <section id="beginner-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <ModuleHeading icon={GraduationCap}>
              {t.modules.kaijuAlphaBeginnerGuide.title}
            </ModuleHeading>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.kaijuAlphaBeginnerGuide.intro}
            </p>
          </div>

          {/* Steps */}
          <div className="scroll-reveal space-y-3 md:space-y-4 mb-8 md:mb-10">
            {t.modules.kaijuAlphaBeginnerGuide.steps.map(
              (step: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                    <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    <p className="flex items-start gap-2 text-sm text-[hsl(var(--nav-theme-light))]">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{step.tip}</span>
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Quick Tips */}
          <div className="scroll-reveal p-4 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <BookOpen className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-base md:text-lg">Quick Tips</h3>
            </div>
            <ul className="space-y-2">
              {t.modules.kaijuAlphaBeginnerGuide.quickTips.map(
                (tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{tip}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Module 2: Tier List */}
      <section id="tier-list" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <ModuleHeading icon={Trophy}>
              {t.modules.kaijuAlphaTierList.title}
            </ModuleHeading>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.kaijuAlphaTierList.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-6 md:space-y-8">
            {t.modules.kaijuAlphaTierList.tiers.map((tier: any, ti: number) => (
              <div
                key={ti}
                className="p-4 md:p-6 bg-white/5 border border-border rounded-xl"
              >
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl bg-[hsl(var(--nav-theme))] text-white text-xl font-bold">
                    {tier.tier}
                  </span>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                      {tier.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">{tier.summary}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {tier.kaiju.map((k: any, ki: number) => (
                    <div
                      key={ki}
                      className="p-4 md:p-5 bg-white/5 border border-border rounded-lg hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className="font-bold">{k.name}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] whitespace-nowrap">
                          {k.role}
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-[hsl(var(--nav-theme-light))] font-semibold w-16 flex-shrink-0">Strengths</span>
                          <span>{k.strengths}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[hsl(var(--nav-theme-light))] font-semibold w-16 flex-shrink-0">Weakness</span>
                          <span>{k.weaknesses}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[hsl(var(--nav-theme-light))] font-semibold w-16 flex-shrink-0">Best for</span>
                          <span>{k.bestFor}</span>
                        </li>
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 4: Tier List 之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 3: Kaiju and Abilities */}
      <section id="kaiju-abilities" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <ModuleHeading icon={Flame}>
              {t.modules.kaijuAlphaKaijuAbilities.title}
            </ModuleHeading>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.kaijuAlphaKaijuAbilities.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.kaijuAlphaKaijuAbilities.kaiju.map((k: any, index: number) => (
              <div
                key={index}
                className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-bold text-base md:text-lg">{k.name}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] whitespace-nowrap">
                    {k.combatRole}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{k.attackStyle}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {k.abilityFocus.map((a: string, ai: number) => (
                    <span
                      key={ai}
                      className="text-xs px-2 py-0.5 rounded-md bg-[hsl(var(--nav-theme)/0.08)] border border-[hsl(var(--nav-theme)/0.2)]"
                    >
                      {a}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-[hsl(var(--nav-theme-light))]">
                  <span className="font-semibold">Best use: </span>
                  {k.bestUse}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 4: Leveling and Cell Farming */}
      <section id="leveling-cell-farming" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <ModuleHeading icon={Zap}>
              {t.modules.kaijuAlphaLevelingCellFarming.title}
            </ModuleHeading>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.kaijuAlphaLevelingCellFarming.intro}
            </p>
          </div>

          {/* Steps */}
          <div className="scroll-reveal space-y-3 md:space-y-4 mb-8 md:mb-10">
            {t.modules.kaijuAlphaLevelingCellFarming.steps.map(
              (step: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                    <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    <p className="flex items-start gap-2 text-sm text-[hsl(var(--nav-theme-light))]">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{step.tip}</span>
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Quick Tips */}
          <div className="scroll-reveal p-4 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Zap className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-base md:text-lg">Farming Tips</h3>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {t.modules.kaijuAlphaLevelingCellFarming.quickTips.map(
                (tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{tip}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Module 5: Controls and Combat Guide */}
      <section id="controls-and-combat-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <ModuleHeading icon={Swords}>
              {t.modules.kaijuAlphaControlsAndCombatGuide.title}
            </ModuleHeading>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.kaijuAlphaControlsAndCombatGuide.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {t.modules.kaijuAlphaControlsAndCombatGuide.controls.map(
              (c: any, index: number) => (
                <div
                  key={index}
                  className="p-4 md:p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="min-w-[3.5rem] text-center px-3 py-1.5 rounded-lg bg-[hsl(var(--nav-theme)/0.15)] border border-[hsl(var(--nav-theme)/0.4)] font-mono text-sm font-bold text-[hsl(var(--nav-theme-light))]">
                      {c.input}
                    </span>
                    <h3 className="font-bold text-sm md:text-base">{c.action}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{c.bestUse}</p>
                  <p className="flex items-start gap-2 text-sm text-[hsl(var(--nav-theme-light))]">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{c.combatTip}</span>
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 5: Controls 模块之后的移动端横幅 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 6: Unlock Requirements */}
      <section id="unlock-requirements" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <ModuleHeading icon={KeyRound}>
              {t.modules.kaijuAlphaUnlockRequirements.title}
            </ModuleHeading>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.kaijuAlphaUnlockRequirements.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-3">
            {t.modules.kaijuAlphaUnlockRequirements.unlocks.map(
              (u: any, index: number) => {
                const isOpen = unlockExpanded === index;
                return (
                  <div
                    key={index}
                    className="border border-border rounded-xl overflow-hidden bg-white/5"
                  >
                    <button
                      onClick={() => setUnlockExpanded(isOpen ? null : index)}
                      className="w-full flex items-center justify-between gap-3 p-4 md:p-5 text-left hover:bg-white/5 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <KeyRound className="w-5 h-5 text-[hsl(var(--nav-theme-light))] flex-shrink-0" />
                        <span className="font-semibold text-sm md:text-base">
                          {u.name}
                        </span>
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 md:px-5 pb-5">
                        <p className="text-sm text-[hsl(var(--nav-theme-light))] font-medium mb-3">
                          Requirement: {u.requirement}
                        </p>
                        <ol className="space-y-2 mb-4">
                          {u.steps.map((s: string, si: number) => (
                            <li key={si} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--nav-theme)/0.15)] text-xs font-bold text-[hsl(var(--nav-theme-light))]">
                                {si + 1}
                              </span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ol>
                        {u.landmarks && u.landmarks.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Key landmarks</p>
                            <div className="flex flex-wrap gap-1.5">
                              {u.landmarks.map((lm: string, li: number) => (
                                <span
                                  key={li}
                                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-[hsl(var(--nav-theme)/0.08)] border border-[hsl(var(--nav-theme)/0.2)]"
                                >
                                  <MapPin className="w-3 h-3 text-[hsl(var(--nav-theme-light))]" />
                                  {lm}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="flex items-start gap-2 text-sm p-3 rounded-lg bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.2)]">
                          <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                          <span>{u.tip}</span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* Module 7: Limit Break and Upgrades */}
      <section id="limit-break-and-upgrades" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <ModuleHeading icon={Rocket}>
              {t.modules.kaijuAlphaLimitBreakAndUpgrades.title}
            </ModuleHeading>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.kaijuAlphaLimitBreakAndUpgrades.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.kaijuAlphaLimitBreakAndUpgrades.upgrades.map(
              (u: any, index: number) => (
                <div
                  key={index}
                  className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                      {u.stage}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.2)] border border-[hsl(var(--nav-theme)/0.4)] text-[hsl(var(--nav-theme-light))] font-semibold">
                      {u.priority}
                    </span>
                  </div>
                  <h3 className="font-bold text-base md:text-lg mb-3">{u.name}</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <span className="text-muted-foreground">
                        <span className="text-[hsl(var(--nav-theme-light))] font-semibold">Requirement: </span>
                        {u.requirement}
                      </span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">
                        <span className="text-[hsl(var(--nav-theme-light))] font-semibold">Benefit: </span>
                        {u.benefit}
                      </span>
                    </li>
                  </ul>
                  <p className="flex items-start gap-2 text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                    <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                    <span>{u.advice}</span>
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 8: Updates and New Kaiju */}
      <section id="updates-and-new-kaiju" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <ModuleHeading icon={Newspaper}>
              {t.modules.kaijuAlphaUpdatesAndNewKaiju.title}
            </ModuleHeading>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.kaijuAlphaUpdatesAndNewKaiju.intro}
            </p>
          </div>

          <div className="scroll-reveal relative pl-6 md:pl-8 border-l-2 border-[hsl(var(--nav-theme)/0.3)] space-y-6 md:space-y-8">
            {t.modules.kaijuAlphaUpdatesAndNewKaiju.updates.map(
              (entry: any, index: number) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[1.6rem] md:-left-[2.1rem] w-4 h-4 rounded-full bg-[hsl(var(--nav-theme))] border-2 border-background" />
                  <div className="p-4 md:p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] font-mono">
                        {entry.update}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.2)] border border-[hsl(var(--nav-theme)/0.4)] text-[hsl(var(--nav-theme-light))] font-semibold">
                        <Clock className="w-3 h-3" />
                        {entry.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-base md:text-lg mb-2">
                      {entry.headline}
                    </h3>
                    <ul className="space-y-1.5">
                      {entry.changes.map((c: string, ci: number) => (
                        <li key={ci} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.reddit.com/r/GODZILLA/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.reddit}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=dLyMYKGxBzI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.youtube}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/communities/1014890693/SULU-KAKA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.robloxCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/games/139769003880269/Kaiju-Alpha"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.roblox}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
