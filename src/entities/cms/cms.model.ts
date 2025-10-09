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
  __component: string;
  id: number;
  text: string;
  heading: string;
  reversed: boolean;
  list: List | null;
  image: Image;
  button: CTA | null;
}

export interface ImageCardBlock {
  __component: string;
  id: number;
  image: Image;
  card: Card;
}

export interface HeroBlock {
  id: number;
  heading: string;
  subHeading: string;
  cta: CTA[];
  image: Image;
  list: List;
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
  __component: string;
  id: number;
  heading: string;
  subHeading: string;
  media: {
    id: number;
    documentId: string;
    alternativeText: string | null;
    url: string;
  };
  anchorId: string;
}

export interface SectionTextImageBlock {
  __component: string;
  id: number;
  heading: string;
  subHeading: string;
  imageTextBlocks: TextImageBlock[];
  anchorId: string;
}

export interface SectionUserFeedbackBlock {
  __component: string;
  id: number;
  heading: string;
  subHeading: string;
  feedbackBlocks: UserFeedbackBlock[];
  anchorId: string;
}

export interface SectionCardGridBlock {
  __component: string;
  id: number;
  heading: string;
  subHeading: string;
  cards: Card[];
  anchorId: string;
}

export interface SectionContactFormBlock {
  __component: string;
  id: number;
  heading: string;
  subHeading: string;
  anchorId: string;
}

export interface SectionFaqBlock {
  __component: string;
  id: number;
  heading: string;
  subHeading: string;
  faqs: {
    id: number;
    question: string;
    answer: string;
  }[];
  anchorId: string;
}

export interface SectionImageCardBlock {
  __component: string;
  id: number;
  heading: string;
  subHeading: string;
  imageCardBlock: ImageCardBlock;
  anchorId: string;
}

export interface ImageGridBlock {
  __component: string;
  id: number;
  images: Image[];
  anchorId: string;
}

export type Block =
  | SectionMediaBlock
  | SectionTextImageBlock
  | TextImageBlock
  | SectionUserFeedbackBlock
  | SectionCardGridBlock
  | SectionContactFormBlock
  | SectionFaqBlock
  | ImageGridBlock
  | SectionImageCardBlock
  | ImageCardBlock;

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
  slug: string;
  position: number;
}

export interface StrapiSingleTypeResponse {
  data: PageData;
}

export interface StrapiCollectionTypeResponse {
  data: PageData[];
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  organisation?: string;
  email: string;
  phone?: string;
  message: string;
}
