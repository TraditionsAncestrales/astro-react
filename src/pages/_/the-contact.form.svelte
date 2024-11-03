<script lang="ts" module>
  // I18N **********************************************************************************************************************************
  function i18n(code?: Message) {
    if (code === "BAD_REQUEST") return "Une erreur est survenue.Veuillez contacter un administrateur";
    if (code === "SUCCESS") return "Message envoyé avec succès";
    return "Une erreur est survenue. Veuillez réessayer ultérieurement.";
  }

  // TYPES *********************************************************************************************************************************
  export type TheContactFormProps = {
    class: string;
    submitIcon: Snippet;
    submittingIcon: Snippet;
    sv: SuperValidated<ContactValues, Message>;
  };
</script>

<script lang="ts">
  import * as Form from "@/components/ui/form";
  import { Input } from "@/components/ui/input";
  import { Textarea } from "@/components/ui/textarea";
  import { cn, zContactValues, type ContactValues, type Message } from "@/lib/utils";
  import { actions } from "astro:actions";
  import type { Snippet } from "svelte";
  import { toast } from "svelte-sonner";
  import { superForm, type SuperValidated } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  // PROPS *********************************************************************************************************************************
  let { class: className, submitIcon, submittingIcon, sv }: TheContactFormProps = $props();

  // VARS **********************************************************************************************************************************
  const sf = superForm(sv, {
    validators: zodClient(zContactValues),
    onError: () => toast.error(i18n()),
    onUpdated: ({ form: { message, valid } }) => {
      if (message) valid ? toast.success(i18n(message)) : toast.error(i18n(message));
    },
  });
  const { delayed, enhance, form, submitting } = sf;
</script>

<form method="POST" action={actions.sendMessage} use:enhance class={cn("flex flex-col gap-4", className)}>
  <Form.Field form={sf} name="fullname">
    <Form.Control let:attrs>
      <Form.Label>Votre nom</Form.Label>
      <Input {...attrs} bind:value={$form.fullname} />
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field form={sf} name="email">
    <Form.Control let:attrs>
      <Form.Label>Votre courriel</Form.Label>
      <Input type="email" {...attrs} bind:value={$form.email} />
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field form={sf} name="message">
    <Form.Control let:attrs>
      <Form.Label>Votre message</Form.Label>
      <Textarea rows={5} {...attrs} bind:value={$form.message} />
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Button disabled={$submitting} class="flex gap-2 self-end">
    {#if $delayed}{@render submittingIcon?.()}{:else}{@render submitIcon?.()}{/if}
    Envoyer
  </Form.Button>
</form>
