import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getContactMessage, rhfErrorsFromAstro, zContactValues, type ContactState, type ContactValues, type Message } from "@/lib/utils";
import { experimental_withState } from "@astrojs/react/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { useActionState, useEffect, useMemo, type PropsWithChildren } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { tv } from "tailwind-variants";

// STYLES **********************************************************************************************************************************
const FORM = tv({ base: "flex flex-col gap-4" });

// MAIN ************************************************************************************************************************************
export default function TheContactForm({ className, initState, initValues, initMessage }: TheContactFormProps) {
  const [state, action, isPending] = useActionState(experimental_withState<ContactState | undefined>(actions.sendMessage), initState);

  const message = useMemo(() => getContactMessage(state, isPending), [state, isPending]);

  const form = useForm<ContactValues>({
    mode: "onTouched",
    resolver: zodResolver(zContactValues),
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
          name="fullname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Votre nom</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Votre courriel</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Votre message</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="flex gap-2 self-end">
          Envoyer
        </Button>
      </form>
    </Form>
  );
}

// TYPES *********************************************************************************************************************************
export type TheContactFormProps = PropsWithChildren<{
  className: string;
  initMessage?: Message;
  initState?: ContactState;
  initValues: ContactValues;
}>;
