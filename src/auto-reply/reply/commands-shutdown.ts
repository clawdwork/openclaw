import type { CommandHandler } from "./commands-types.js";
import { logVerbose } from "../../globals.js";
import { setHeartbeatsEnabled, getHeartbeatsEnabled } from "../../infra/heartbeat-runner.js";

/**
 * /shutdown — Disable heartbeat notifications. The agent stops proactive
 * check-ins until the user sends /resume or /heartbeat on.
 */
export const handleShutdownCommand: CommandHandler = async (params, allowTextCommands) => {
  if (!allowTextCommands) {
    return null;
  }
  if (params.command.commandBodyNormalized !== "/shutdown") {
    return null;
  }
  if (!params.command.isAuthorizedSender) {
    logVerbose(
      `Ignoring /shutdown from unauthorized sender: ${params.command.senderId || "<unknown>"}`,
    );
    return { shouldContinue: false };
  }

  const wasEnabled = getHeartbeatsEnabled();
  setHeartbeatsEnabled(false);

  if (!wasEnabled) {
    return {
      shouldContinue: false,
      reply: { text: "⚙️ Heartbeat is already off. Use /resume or /heartbeat on to re-enable." },
    };
  }

  return {
    shouldContinue: false,
    reply: {
      text: "🔇 Shutdown — heartbeat notifications paused. I won't check in until you send /resume or /heartbeat on.",
    },
  };
};

/**
 * /resume — Re-enable heartbeat notifications after a /shutdown.
 */
export const handleResumeCommand: CommandHandler = async (params, allowTextCommands) => {
  if (!allowTextCommands) {
    return null;
  }
  if (params.command.commandBodyNormalized !== "/resume") {
    return null;
  }
  if (!params.command.isAuthorizedSender) {
    logVerbose(
      `Ignoring /resume from unauthorized sender: ${params.command.senderId || "<unknown>"}`,
    );
    return { shouldContinue: false };
  }

  const wasEnabled = getHeartbeatsEnabled();
  setHeartbeatsEnabled(true);

  if (wasEnabled) {
    return {
      shouldContinue: false,
      reply: { text: "⚙️ Heartbeat is already on." },
    };
  }

  return {
    shouldContinue: false,
    reply: { text: "🔔 Resumed — heartbeat notifications re-enabled." },
  };
};

/**
 * /heartbeat [on|off] — Toggle heartbeat directly.
 *   /heartbeat       → show current status
 *   /heartbeat on    → enable
 *   /heartbeat off   → disable
 */
export const handleHeartbeatCommand: CommandHandler = async (params, allowTextCommands) => {
  if (!allowTextCommands) {
    return null;
  }
  const body = params.command.commandBodyNormalized;
  if (!body.startsWith("/heartbeat")) {
    return null;
  }
  // Avoid matching /heartbeat-something or unrelated commands
  if (body !== "/heartbeat" && !body.startsWith("/heartbeat ")) {
    return null;
  }
  if (!params.command.isAuthorizedSender) {
    logVerbose(
      `Ignoring /heartbeat from unauthorized sender: ${params.command.senderId || "<unknown>"}`,
    );
    return { shouldContinue: false };
  }

  const arg = body.replace("/heartbeat", "").trim().toLowerCase();
  const current = getHeartbeatsEnabled();

  if (arg === "on") {
    setHeartbeatsEnabled(true);
    return {
      shouldContinue: false,
      reply: { text: current ? "⚙️ Heartbeat is already on." : "🔔 Heartbeat enabled." },
    };
  }

  if (arg === "off") {
    setHeartbeatsEnabled(false);
    return {
      shouldContinue: false,
      reply: {
        text: current
          ? "🔇 Heartbeat disabled. Use /heartbeat on or /resume to re-enable."
          : "⚙️ Heartbeat is already off.",
      },
    };
  }

  // No argument — show status
  return {
    shouldContinue: false,
    reply: {
      text: `⚙️ Heartbeat is currently **${current ? "on" : "off"}**.\nUsage: \`/heartbeat on\` or \`/heartbeat off\``,
    },
  };
};
