import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  getNewsletterMessage,
  rhfErrorsFromAstro,
  zNewsletterValues,
  type Message,
  type NewsletterState,
  type NewsletterValues,
} from "@/lib/utils";
import { experimental_withState } from "@astrojs/react/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { useActionState, useEffect, useMemo, type PropsWithChildren } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { tv } from "tailwind-variants";

// STYLES **********************************************************************************************************************************
const FORM = tv({ base: "flex flex-col gap-4 sm:flex-row sm:items-center" });
const INPUT = "aria-invalid:border-destructive-400 aria-invalid:focus-visible:ring-destructive-400 focus-visible:ring-secondary";

// MAIN ************************************************************************************************************************************
export default function TheNewsletterForm({ className, initMessage, initState, initValues }: TheNewsletterFormProps) {
  const [state, action, isPending] = useActionState(
    experimental_withState<NewsletterState | undefined>(actions.subscribeToNewsletter),
    initState,
  );

  const message = useMemo(() => getNewsletterMessage(state, isPending), [state, isPending]);

  const form = useForm<NewsletterValues>({
    mode: "onTouched",
    resolver: zodResolver(zNewsletterValues),
    defaultValues: initValues,
    errors: useMemo(() => rhfErrorsFromAstro(state?.error), [state]),
  });
  const { control, formState, handleSubmit, reset } = form;

  useEffect(() => {
    if (message) {
      const { description, code } = message ?? {};
      if (code === "SUCCESS") {
        reset();
        toast.success("Succès", { description });
      } else toast.error("Erreur", { description });
    }
  }, [message, reset]);

  return (
    <Form {...form}>
      <form action={action} onSubmit={formState.isValid ? undefined : handleSubmit(() => true)} className={FORM({ className })}>
        {initMessage && (
          <Alert variant={initMessage.code === "SUCCESS" ? "default" : "destructive"}>
            <AlertTitle>{initMessage.code === "SUCCESS" ? "Succès" : "Erreur"}</AlertTitle>
            <AlertDescription>{initMessage.description}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full sm:max-w-xs xl:max-w-sm">
              <FormControl>
                <Input type="email" placeholder="Votre courriel..." {...field} className={INPUT} />
              </FormControl>
              <FormMessage className="absolute text-destructive-400" />
            </FormItem>
          )}
        />
        <Button type="submit" intent="secondary" disabled={isPending} className="mt-4 w-full justify-center sm:mt-0 sm:w-auto">
          Je m&apos;inscris
        </Button>
      </form>
    </Form>
  );
}

// TYPES *********************************************************************************************************************************
export type TheNewsletterFormProps = PropsWithChildren<{
  className: string;
  initMessage?: Message;
  initState?: NewsletterState;
  initValues: NewsletterValues;
}>;
