export interface Image {
  id: number;
  documentId: string;
  alternativeText: string | null;
  url: string;
  formats?: {
    thumbnail?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
    large?: ImageFormat;
  };
}

interface ImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: string | null;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
}

export interface CTA {
  id: number;
  href: string;
  label: string;
  isExternal: boolean;
  isButtonLink: boolean;
  type: 'Primary' | 'Secondary';
}

export interface ListItem {
  id: number;
  label: string;
  icon: Image;
}

export interface List {
  id: number;
  heading: string;
  items: ListItem[];
}

export interface Card {
  id: number;
  image: Image;
  heading: string;
  text: string;
}

export interface TextImageBlock {
  __component: 'block.text-image';
  id: number;
  text: string;
  heading: string;
  reversed: boolean;
  list: List | null;
  image: Image;
  button: CTA | null;
}

export interface HeroBlock {
  id: number;
  heading: string;
  subHeading: string;
  cta: CTA[];
  image: Image;
}

export interface FooterBlock {
  id: number;
  heading: string;
  subHeading: string;
  cta: CTA | null;
  contactLink: CTA | null;
}

export interface UserFeedbackBlock {
  id: number;
  image: Image;
  name: string;
  location: string;
  quote: string;
}

export interface SectionMediaBlock {
  __component: 'blocks.section-heading-media';
  id: number;
  heading: string;
  subHeading: string;
  media: {
    id: number;
    documentId: string;
    alternativeText: string | null;
    url: string;
  };
  test: {
    id: number;
    documentId: string;
    alternativeText: string | null;
    url: string;
  };
}

export interface SectionTextImageBlock {
  __component: 'blocks.section-heading-text-image';
  id: number;
  heading: string;
  subHeading: string;
  imageTextBlocks: TextImageBlock[];
}

export interface SectionUserFeedbackBlock {
  __component: 'layout.section-heading-user-feedback';
  id: number;
  heading: string;
  subHeading: string;
  feedbackBlocks: UserFeedbackBlock[];
}

export interface SectionCardGridBlock {
  __component: 'blocks.section-heading-card-grid';
  id: number;
  heading: string;
  subHeading: string;
  cards: Card[];
}

export type Block =
  | SectionMediaBlock
  | SectionTextImageBlock
  | TextImageBlock
  | SectionUserFeedbackBlock
  | SectionCardGridBlock;

export interface PageData {
  id: number;
  documentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blocks: Block[];
  footer: FooterBlock;
  hero: HeroBlock;
}

export interface StrapiResponse {
  data: PageData;
}
