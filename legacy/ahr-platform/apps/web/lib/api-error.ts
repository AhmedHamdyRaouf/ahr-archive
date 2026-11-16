import { NextResponse } from "next/server";
import { UnauthenticatedError, ForbiddenError } from "@ahr/auth";
import {
  NotFoundError,
  RepositoryError,
  InvalidStatusTransitionError,
  ValidationError,
  ForceDeleteBlockedError,
} from "@ahr/cms-core";
import { BusinessRuleError, TaxonomyDomainMismatchError } from "@ahr/content";
import { MediaValidationError } from "@ahr/media";
import { MediaLibraryValidationError } from "@ahr/media-library";
import { PlatformLinkValidationError } from "@ahr/relationships";
import { InvalidModerationTransitionError, ModerationValidationError } from "@ahr/workflow";
import { AiProviderUnavailableError, MalformedAiResponseError } from "@ahr/ai";

/**
 * Implements: API Specification 01 - API Standards (response envelope),
 * 12 - Error Codes (error object shape + status mapping). One shared
 * mapping — every Route Handler in this app funnels its catch block
 * through `errorToResponse`, never inventing its own error shape.
 */
export function errorToResponse(error: unknown): NextResponse {
  if (error instanceof UnauthenticatedError) {
    return NextResponse.json(
      { data: null, error: { code: "UNAUTHENTICATED", message: error.message } },
      { status: 401 },
    );
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      { data: null, error: { code: "FORBIDDEN", message: error.message } },
      { status: 403 },
    );
  }
  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { data: null, error: { code: "NOT_FOUND", message: error.message } },
      { status: 404 },
    );
  }
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: error.message,
          details: { fieldErrors: error.fieldErrors },
        },
      },
      { status: 422 },
    );
  }
  if (error instanceof InvalidStatusTransitionError) {
    return NextResponse.json(
      { data: null, error: { code: "INVALID_STATUS_TRANSITION", message: error.message } },
      { status: 409 },
    );
  }
  if (error instanceof ForceDeleteBlockedError) {
    return NextResponse.json(
      { data: null, error: { code: "FORCE_DELETE_BLOCKED", message: error.message } },
      { status: 409 },
    );
  }
  if (error instanceof TaxonomyDomainMismatchError) {
    return NextResponse.json(
      { data: null, error: { code: "TAXONOMY_DOMAIN_MISMATCH", message: error.message } },
      { status: 422 },
    );
  }
  if (error instanceof BusinessRuleError) {
    return NextResponse.json(
      { data: null, error: { code: error.code, message: error.message } },
      { status: 422 },
    );
  }
  if (error instanceof MediaValidationError) {
    return NextResponse.json(
      { data: null, error: { code: error.code, message: error.message } },
      { status: 422 },
    );
  }
  if (error instanceof MediaLibraryValidationError) {
    return NextResponse.json(
      { data: null, error: { code: error.code, message: error.message } },
      { status: 422 },
    );
  }
  if (error instanceof PlatformLinkValidationError) {
    return NextResponse.json(
      { data: null, error: { code: error.code, message: error.message } },
      { status: 422 },
    );
  }
  if (error instanceof InvalidModerationTransitionError) {
    return NextResponse.json(
      { data: null, error: { code: "INVALID_STATUS_TRANSITION", message: error.message } },
      { status: 409 },
    );
  }
  if (error instanceof ModerationValidationError) {
    return NextResponse.json(
      { data: null, error: { code: error.code, message: error.message } },
      { status: 422 },
    );
  }
  if (error instanceof AiProviderUnavailableError || error instanceof MalformedAiResponseError) {
    // Implements: 07-API.md §8 — PROVIDER_UNAVAILABLE (502) is the one
    // reserved code for "an upstream provider (OpenAI, email) failed or
    // timed out." A malformed response is treated the same way from the
    // client's perspective (14-AI-Integration.md §10 — discarded
    // entirely, never partially applied), not as a new, invented code.
    return NextResponse.json(
      { data: null, error: { code: "PROVIDER_UNAVAILABLE", message: error.message } },
      { status: 502 },
    );
  }
  if (error instanceof RepositoryError) {
    // Fixed 2026-07-21: this branch used to hide the real error entirely —
    // the client message is deliberately generic (never leak internal
    // details), but the actual cause was never logged anywhere either,
    // making every RepositoryError impossible to debug from server logs.
    // eslint-disable-next-line no-console
    console.error("[api] RepositoryError:", error.message);
    return NextResponse.json(
      { data: null, error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
      { status: 500 },
    );
  }

  // eslint-disable-next-line no-console
  console.error("[api] unhandled error:", error);
  return NextResponse.json(
    { data: null, error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
    { status: 500 },
  );
}
