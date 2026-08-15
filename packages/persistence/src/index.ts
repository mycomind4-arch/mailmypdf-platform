export type {
  RepositoryErrorCode,
  OwnedRecord,
  VersionedRecord,
  OwnedRepository,
  AuditEntry,
  AppendOnlyAuditStore,
  SaveState,
} from "./persistence.js";
export {
  RepositoryError,
  requireOwnerId,
  assertOwner,
  mergeAppendOnlyVersions,
  executeSave,
  createSavingState,
} from "./persistence.js";
