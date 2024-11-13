import { resend } from "@/lib/resend";
import { zContactValues, zNewsletterValues } from "@/lib/utils";
import mailchimp from "@mailchimp/mailchimp_marketing";
import { ActionError, defineAction } from "astro:actions";
import { MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID, MAILCHIMP_SERVER } from "astro:env/server";
import md5 from "md5";

export const server = {
  sendMessage: defineAction({
    accept: "form",
    input: zContactValues,
    handler: async ({ email, fullname, message: content }) => {
      const { error } = await resend.emails.send({
        from: "contact@traditionsancestrales.fr",
        to: "niama.traditions.ancestrales@gmail.com",
        subject: "Formulaire de contact",
        html: `<dl><dt>Nom :</dt><dd>${fullname}</dd><dt>Courriel :</dt><dd>${email}</dd><dt>Message :</dt><dd>${content}</dd></dl>`,
      });
      if (error) throw new ActionError({ code: "BAD_REQUEST" });
      return { code: "SUCCESS" } as const;
    },
  }),
  subscribeToNewsletter: defineAction({
    accept: "form",
    input: zNewsletterValues,
    handler: async ({ email }) => {
      const listId = MAILCHIMP_LIST_ID;
      if (!listId) throw new ActionError({ code: "BAD_REQUEST" });
      const subscriberHash = md5(email.toLowerCase());
      mailchimp.setConfig({ apiKey: MAILCHIMP_API_KEY, server: MAILCHIMP_SERVER });
      try {
        const { status } = await mailchimp.lists.getListMember(listId, subscriberHash);
        if (status !== "unsubscribed") throw new ActionError({ code: "CONFLICT" });
        await mailchimp.lists.updateListMember(listId, subscriberHash, { status: "subscribed" });
      } catch (error) {
        try {
          await mailchimp.lists.addListMember(listId, { email_address: email, status: "subscribed" });
        } catch (error) {
          throw new ActionError({ code: "BAD_REQUEST" });
        }
      }
      return { code: "SUCCESS" } as const;
    },
  }),
};
