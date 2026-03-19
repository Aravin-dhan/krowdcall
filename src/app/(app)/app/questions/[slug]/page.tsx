import { redirect } from "next/navigation";

type QuestionPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { slug } = await params;
  redirect(`/markets/${slug}`);
}
