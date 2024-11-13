import { z } from "astro/zod";
import { ActionError, actions, isInputError, type ActionErrorCode, type SafeResult } from "astro:actions";
import { clsx, type ClassValue } from "clsx";
import type { FieldErrors, FieldValues } from "react-hook-form";
import { twMerge } from "tailwind-merge";

// FORM ************************************************************************************************************************************
function getMessageFor(i18n: MessageI18n) {
  return <D extends FieldValues>(state: State<D> | undefined, isPending = false): Message | undefined => {
    const code = state?.data?.code ?? state?.error?.code ?? "INTERNAL_SERVER_ERROR";
    return !state || isPending ? undefined : { description: i18n[code] ?? "Erreur inconnue", code };
  };
}

export function getValuesFor<V extends FieldValues>({ defaultValues, shouldSkip }: GetValuesForParams<V>) {
  return async (request: Request, state: State<V>) => {
    if (request.method !== "POST" || (shouldSkip?.(state) ?? false)) return defaultValues;
    const formData = await request.clone().formData();
    formData.delete("_astroAction");
    formData.delete("_astroActionState");
    formData.delete("$ACTION_KEY");
    return Object.fromEntries(formData.entries()) as V;
  };
}

export function rhfErrorsFromAstro<T extends FieldValues = FieldValues>(error?: ActionError) {
  if (!error) return;
  if (!isInputError(error)) return { root: { type: error.code } } as FieldErrors<T>;
  return Object.fromEntries(Object.entries(error.fields).map(([name, errors]) => [name, { message: errors?.[0] }])) as FieldErrors<T>;
}

// CONTACT *********************************************************************************************************************************
export const zContactValues = z.object({
  email: z.string({ message: "Ce champ est requis." }).email("Ce courriel est invalide.").min(1, "Ce champ est requis."),
  fullname: z.string({ message: "Ce champ est requis." }).min(1, "Ce champ est requis."),
  message: z.string({ message: "Ce champ est requis." }).min(1, "Ce champ est requis."),
});
export type ContactValues = z.infer<typeof zContactValues>;

export const defaultContactValues: ContactValues = { email: "", fullname: "", message: "" };

export const getContactMessage = getMessageFor({
  SUCCESS: "Votre message a été envoyé avec succès.",
  BAD_REQUEST: "Veuillez réessayer ultérieurement.",
});

export type ContactState = Awaited<ReturnType<typeof actions.sendMessage>>;

// NEWSLETTER ******************************************************************************************************************************
export const zNewsletterValues = z.object({
  email: z.string().email("Ce courriel est invalide.").min(1, "Ce champ est requis."),
});
export type NewsletterValues = z.infer<typeof zNewsletterValues>;

export const defaultNewsletterValues: NewsletterValues = { email: "" };

export const getNewsletterMessage = getMessageFor({
  SUCCESS: "Veuillez valider votre inscription dans le courriel reçu.",
  BAD_REQUEST: "Veuillez réessayer ultérieurement.",
  CONFLICT: "Vous êtes déjà inscrit·e.",
});

export type NewsletterState = Awaited<ReturnType<typeof actions.subscribeToNewsletter>>;

// STYLES **********************************************************************************************************************************
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// TYPES ***********************************************************************************************************************************
export type State<V extends FieldValues = FieldValues> = SafeResult<V, { code: "SUCCESS" }> | undefined;

export type GetValuesForParams<V extends FieldValues> = {
  defaultValues: V;
  shouldSkip?: (state: State<V>) => boolean;
};

export type MessageI18n = Partial<Record<ActionErrorCode | "SUCCESS", string>>;
export type Message = { description: string; code: ActionErrorCode | "SUCCESS" };
