-- Editable "Service interested in" choices on the contact form (one per line), starting from the current service groups.
INSERT INTO "ContentBlock" ("pageKey", "blockKey", "label", "help", "type", "value", "sortOrder", "updatedAt")
SELECT 'contact', 'form.service_options', 'Service interested in: choices (one per line)', '', 'TEXTAREA',
  COALESCE((SELECT string_agg("title", E'\n' ORDER BY "sortOrder") FROM "ServiceCategory" WHERE "status" = 'PUBLISHED'), ''),
  COALESCE((SELECT "sortOrder" FROM "ContentBlock" WHERE "pageKey" = 'contact' AND "blockKey" = 'form.too_many_message'), 0),
  NOW()
ON CONFLICT ("pageKey", "blockKey") DO NOTHING;
