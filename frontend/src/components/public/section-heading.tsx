import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

/** Home Page section eyebrow — single source of truth */
export const sectionEyebrowClass =
  "mb-2.5 text-[.78rem] font-bold uppercase tracking-widest text-blue";

/** Home Page section title (h2) — single source of truth */
export const sectionTitleClass =
  "font-display text-[clamp(1.7rem,3vw,2.4rem)] font-bold leading-tight text-gray-900";

/** Home Page section description — single source of truth */
export const sectionDescriptionClass =
  "mx-auto mt-3.5 max-w-[600px] text-[.98rem] text-gray-600";

/** Home Page centered section heading wrapper */
export const sectionHeadingClass = "mb-13 text-center";

type Align = "center" | "left";

type SectionEyebrowProps = {
  children: ReactNode;
  className?: string;
  light?: boolean;
};

export function SectionEyebrow({ children, className, light }: SectionEyebrowProps) {
  return (
    <div className={cn(sectionEyebrowClass, light && "text-[#93c5fd]", className)}>
      {children}
    </div>
  );
}

type SectionTitleProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  inverse?: boolean;
};

export function SectionTitle({
  children,
  as: Tag = "h2",
  className,
  inverse,
}: SectionTitleProps) {
  return (
    <Tag className={cn(sectionTitleClass, inverse && "text-white", className)}>
      {children}
    </Tag>
  );
}

type SectionDescriptionProps = {
  children: ReactNode;
  className?: string;
  align?: Align;
  inverse?: boolean;
};

export function SectionDescription({
  children,
  className,
  align = "center",
  inverse,
}: SectionDescriptionProps) {
  return (
    <p
      className={cn(
        sectionDescriptionClass,
        align === "left" && "mx-0 mt-3.5 max-w-none",
        inverse && "text-white/90",
        className,
      )}
    >
      {children}
    </p>
  );
}

type SectionHeadingProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: Align;
  className?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  inverse?: boolean;
  lightEyebrow?: boolean;
  as?: ElementType;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  eyebrowClassName,
  titleClassName,
  descriptionClassName,
  inverse,
  lightEyebrow,
  as: TitleTag = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(sectionHeadingClass, align === "left" && "text-left", className)}
    >
      {eyebrow ? (
        <SectionEyebrow className={eyebrowClassName} light={lightEyebrow}>
          {eyebrow}
        </SectionEyebrow>
      ) : null}
      <SectionTitle as={TitleTag} className={titleClassName} inverse={inverse}>
        {title}
      </SectionTitle>
      {description ? (
        <SectionDescription
          className={descriptionClassName}
          align={align}
          inverse={inverse}
        >
          {description}
        </SectionDescription>
      ) : null}
    </div>
  );
}
