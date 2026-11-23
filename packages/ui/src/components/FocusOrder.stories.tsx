import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { Button } from "./Button";
import { StoryCanvas } from "./story-frame";
import { Text } from "./Text";
import { TextInput } from "./TextInput";

/**
 * Focus-order stories (phase 03, task 8). The phase's QA journey 3:
 * keyboard-navigate the Button and TextInput stories — visible focus,
 * logical order, Enter/Space activation. On web (react-native-web) these
 * render real focusable DOM, so the tab order here is what a keyboard user
 * gets. Reviewers Tab through: each control shows the theme's `focus` ring
 * token, and the order matches the visual top-to-bottom, left-to-right
 * reading order.
 *
 * The visible focus indicator is the TextInput/Button border swapping to
 * the `focus` role token on focus (fieldStyles / buttonStyles); there is no
 * custom outline — the platform default plus the token border must be
 * enough. If a future audit finds the default outline insufficient, that is
 * a token change, not a per-story one.
 *
 * Fixture text is story copy (stories/fixtures.ts) — not shipped UI (D-14).
 */

function FocusForm() {
  return (
    <View style={{ gap: 16, maxWidth: 360 }}>
      <Text variant="heading">Keyboard order</Text>
      <Text variant="bodySmall">
        Press Tab to move through the fields and the button. The focused control
        shows the focus ring; Enter/Space activates the button.
      </Text>
      <TextInput label="Name" hint="First field in the order" />
      <TextInput label="Email" hint="Second field" />
      <TextInput label="Notes" placeholder="Third field" />
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Button label="Save" onPress={() => {}} />
        <Button label="Cancel" variant="secondary" onPress={() => {}} />
      </View>
    </View>
  );
}

const meta: Meta = {
  title: "Patterns/Focus order",
  component: View,
};

export default meta;

type Story = StoryObj<typeof meta>;

/** The full form: three text inputs then two buttons, in reading order. */
export const FormTabOrder: Story = {
  render: () => (
    <StoryCanvas>
      <FocusForm />
    </StoryCanvas>
  ),
};

/** Buttons alone: each is a 44pt target reachable by Tab, Enter/Space. */
export const ButtonTabStops: Story = {
  render: () => (
    <StoryCanvas>
      <View style={{ gap: 12, maxWidth: 360 }}>
        <Button label="Primary" onPress={() => {}} />
        <Button label="Secondary" variant="secondary" onPress={() => {}} />
        <Button label="Ghost" variant="ghost" onPress={() => {}} />
        <Button label="Disabled" disabled />
      </View>
    </StoryCanvas>
  ),
};

/** Inputs alone: focus moves label-to-error in DOM order, error included. */
export const TextInputTabStops: Story = {
  render: () => (
    <StoryCanvas>
      <View style={{ gap: 16, maxWidth: 360 }}>
        <TextInput label="Search" hint="Idle" />
        <TextInput label="Email" error="Missing an @ sign" defaultValue="x" />
        <TextInput
          label="Village"
          hint="Read-only"
          editable={false}
          value="Vila"
        />
      </View>
    </StoryCanvas>
  ),
};
