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
  __component: 'blocks.hero';
  id: number;
  heading: string;
  subHeading: string;
  cta: CTA[];
  image: Image;
}

export interface SectionHeadingMediaBlock {
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

export interface SectionHeadingTextImageBlock {
  __component: 'blocks.section-heading-text-image';
  id: number;
  heading: string;
  imageTextBlocks: TextImageBlock[];
}

export type Block =
  | HeroBlock
  | SectionHeadingMediaBlock
  | SectionHeadingTextImageBlock
  | TextImageBlock;

export interface PageData {
  id: number;
  documentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blocks: Block[];
}

export interface StrapiResponse {
  data: PageData;
}
