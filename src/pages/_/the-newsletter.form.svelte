<script lang="ts" module>
  // I18N **********************************************************************************************************************************
  function i18n(code?: Message) {
    if (code === "BAD_REQUEST") return "Une erreur est survenue.Veuillez contacter un administrateur";
    if (code === "CONFLICT") return "Vous êtes déjà inscrit.e";
    if (code === "SUCCESS") return "Inscription réalisée avec succès";
    return "Une erreur est survenue. Veuillez réessayer ultérieurement.";
  }

  // TYPES *********************************************************************************************************************************
  export type TheNewsletterFormProps = {
    class: ClassValue;
    submitIcon: Snippet;
    submittingIcon: Snippet;
    sv: SuperValidated<NewsletterValues, Message>;
  };

  // STYLES ********************************************************************************************************************************
  const FORM = tv({ base: "flex flex-col gap-4 sm:flex-row sm:items-center" });
  const INPUT = "aria-invalid:border-destructive-400 aria-invalid:focus-visible:ring-destructive-400 focus-visible:ring-secondary";
</script>

<script lang="ts">
  import * as Form from "@/components/ui/form";
  import { Input } from "@/components/ui/input";
  import { zNewsletterValues, type Message, type NewsletterValues } from "@/lib/utils";
  import { actions } from "astro:actions";
  import type { Snippet } from "svelte";
  import { toast } from "svelte-sonner";
  import { superForm, type SuperValidated } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { tv, type ClassValue } from "tailwind-variants";

  // PROPS *********************************************************************************************************************************
  let { class: className, submitIcon, submittingIcon, sv }: TheNewsletterFormProps = $props();

  // VARS **********************************************************************************************************************************
  const sf = superForm(sv, {
    validators: zodClient(zNewsletterValues),
    onError: () => {
      toast.error(i18n());
    },
    onUpdated: ({ form: { message, valid } }) => {
      if (message) valid ? toast.success(i18n(message)) : toast.error(i18n(message));
    },
  });
  const { delayed, enhance, form, submitting } = sf;
</script>

<form method="POST" action={actions.subscribeToNewsletter} use:enhance novalidate class={FORM({ className })}>
  <Form.Field form={sf} name="email" class="w-full sm:max-w-xs xl:max-w-sm">
    <Form.Control let:attrs>
      <Input {...attrs} type="email" placeholder="Votre courriel..." bind:value={$form.email} class={INPUT} />
    </Form.Control>
    <Form.FieldErrors class="text-destructive-400 absolute" />
  </Form.Field>
  <Form.Button disabled={$submitting} intent="secondary" class="mt-4 w-full justify-center sm:mt-0 sm:w-auto">
    {#if $delayed}{@render submittingIcon?.()}{:else}{@render submitIcon?.()}{/if}
    Je m'inscris
  </Form.Button>
</form>
