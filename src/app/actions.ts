"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createMarketDispute,
  createQuestion,
  getQuestionBySlug,
  getQuestionForecast,
  getUserWalletSummary,
  resolveQuestion,
  resolveMarketDispute,
  updateQuestionStatus,
  upsertForecast
} from "@/lib/db";
import { electionPack2026 } from "@/lib/election-pack";
import { iplPack2026 } from "@/lib/ipl-pack";
import {
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  requireAdmin,
  requireUser,
  resendVerificationEmail,
  resetPassword
} from "@/lib/auth";
import { slugify } from "@/lib/utils";

const authSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8)
});

const signupSchema = authSchema.extend({
  displayName: z.string().trim().min(2).max(40)
});

const emailOnlySchema = z.object({
  email: z.string().trim().email()
});

const passwordResetSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8)
});

const questionSchema = z.object({
  title: z.string().min(12).max(120),
  description: z.string().min(20).max(280),
  category: z.string().min(3).max(40),
  closeAt: z.string().min(1),
  resolveBy: z.string().min(1),
  resolutionSource: z.string().min(4).max(120),
  status: z.enum(["draft", "active"])
});

const disputeSchema = z.object({
  questionId: z.string().min(1),
  message: z.string().trim().min(12).max(500)
});

export type ActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

export async function signupAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ageConfirm = formData.get("ageConfirm");
  if (ageConfirm !== "1") {
    return {
      status: "error",
      message: "You must confirm you are at least 18 years old and agree to the Terms."
    };
  }

  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Use a valid name, email, and a password with at least 8 characters."
    };
  }

  const result = await registerUser(parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message: result.message
    };
  }

  if (result.message === "") {
    redirect("/app");
  }

  return {
    status: "success",
    message: result.message
  };
}

export async function loginAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Enter a valid email and password."
    };
  }

  const result = await loginUser(parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message: result.message
    };
  }

  redirect("/app");
}

export async function resendVerificationAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = emailOnlySchema.safeParse({
    email: formData.get("email")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Enter a valid email address."
    };
  }

  const result = await resendVerificationEmail(parsed.data);

  return {
    status: result.ok ? "success" : "error",
    message: result.message
  };
}

export async function requestPasswordResetAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = emailOnlySchema.safeParse({
    email: formData.get("email")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Enter a valid email address."
    };
  }

  const result = await requestPasswordReset(parsed.data);

  return {
    status: result.ok ? "success" : "error",
    message: result.message
  };
}

export async function resetPasswordAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = passwordResetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Use a valid reset link and a password with at least 8 characters."
    };
  }

  const result = await resetPassword(parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message: result.message
    };
  }

  redirect("/app");
}

export async function logoutAction() {
  await logoutUser();
  redirect("/");
}

export async function forecastAction(formData: FormData) {
  const user = await requireUser();
  const questionSlug = z.string().parse(formData.get("slug"));
  const side = z.enum(["agree", "disagree"]).parse(formData.get("side"));
  const probability = z.coerce.number().min(1).max(99).parse(formData.get("probability"));
  const stakeCoins = z.coerce.number().int().min(1).max(1000).parse(formData.get("stakeCoins"));

  const question = await getQuestionBySlug(questionSlug);

  if (!question || question.status !== "active") {
    redirect("/");
  }

  if (new Date(question.closeAt).getTime() <= Date.now()) {
    redirect(`/markets/${question.slug}`);
  }

  const [existingForecast, wallet] = await Promise.all([
    getQuestionForecast(question.id, user.id),
    getUserWalletSummary(user.id)
  ]);
  const spendableCoins = wallet.availableCoins + (existingForecast?.stakeCoins ?? 0);

  if (stakeCoins > spendableCoins) {
    redirect(`/markets/${question.slug}?side=${side}&error=coins`);
  }

  await upsertForecast({
    questionId: question.id,
    userId: user.id,
    side,
    probability,
    stakeCoins
  });

  redirect(`/markets/${question.slug}?side=${side}&submitted=1`);
}

export async function createQuestionAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = questionSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    closeAt: formData.get("closeAt"),
    resolveBy: formData.get("resolveBy"),
    resolutionSource: formData.get("resolutionSource"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Fill every field with a valid question configuration."
    };
  }

  const slug = slugify(parsed.data.title);
  const existing = await getQuestionBySlug(slug);

  if (existing) {
    return {
      status: "error",
      message: "That question slug already exists. Change the title slightly."
    };
  }

  await createQuestion({
    ...parsed.data,
    closeAt: new Date(parsed.data.closeAt).toISOString(),
    resolveBy: new Date(parsed.data.resolveBy).toISOString(),
    slug,
    status: parsed.data.status,
    createdBy: admin.id
  });

  return {
    status: "success",
    message: parsed.data.status === "active" ? "Question published." : "Draft saved."
  };
}

export async function setQuestionStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const questionId = z.string().parse(formData.get("questionId"));
  const status = z.enum(["draft", "active", "locked"]).parse(formData.get("status"));
  const note = z.string().parse(String(formData.get("note") ?? ""));
  await updateQuestionStatus({ questionId, status, actorUserId: admin.id, note });
  redirect("/app/admin");
}

export async function resolveQuestionAction(formData: FormData) {
  const admin = await requireAdmin();
  const questionId = z.string().parse(formData.get("questionId"));
  const outcome = z.coerce.number().min(0).max(1).parse(formData.get("outcome"));
  const note = z.string().parse(String(formData.get("note") ?? ""));
  await resolveQuestion({ questionId, outcome, actorUserId: admin.id, note });
  redirect("/app/admin");
}

export async function importElectionPackAction() {
  const admin = await requireAdmin();

  for (const question of electionPack2026) {
    const slug = slugify(question.title);
    const existing = await getQuestionBySlug(slug);

    if (existing) {
      continue;
    }

    await createQuestion({
      ...question,
      slug,
      createdBy: admin.id
    });
  }

  redirect("/app/admin");
}

export async function importIPLPackAction() {
  const admin = await requireAdmin();

  for (const question of iplPack2026) {
    const slug = slugify(question.title);
    const existing = await getQuestionBySlug(slug);
    if (existing) continue;
    await createQuestion({ ...question, slug, createdBy: admin.id });
  }

  redirect("/app/admin");
}

export async function createMarketDisputeAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = disputeSchema.safeParse({
    questionId: formData.get("questionId"),
    message: formData.get("message")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Add a clear dispute note with at least 12 characters."
    };
  }

  await createMarketDispute({
    questionId: parsed.data.questionId,
    createdBy: user.id,
    message: parsed.data.message
  });

  return {
    status: "success",
    message: "Dispute submitted for review."
  };
}

export async function resolveMarketDisputeAction(formData: FormData) {
  const admin = await requireAdmin();
  const disputeId = z.string().parse(formData.get("disputeId"));
  const questionId = z.string().parse(formData.get("questionId"));
  const status = z.enum(["resolved", "dismissed"]).parse(formData.get("status"));
  const resolutionNote = z.string().trim().min(8).parse(String(formData.get("resolutionNote") ?? ""));

  await resolveMarketDispute({
    disputeId,
    questionId,
    resolvedBy: admin.id,
    status,
    resolutionNote
  });

  redirect("/app/admin");
}
