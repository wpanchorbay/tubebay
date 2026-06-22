import { FC } from "react";
import { ClassicSettingsTable, ClassicSelect, ClassicCheckbox } from "../../classics";
import { PluginSettings } from "../../../utils/types";

interface PlayerTabProps {
  settings: PluginSettings;
  updateLocalSetting: (key: keyof PluginSettings, value: any) => void;
}

export const PlayerTab: FC<PlayerTabProps> = ({ settings, updateLocalSetting }) => {
  return (
    <>
      <ClassicSettingsTable
        title="Video Player Settings"
        description="Configure how YouTube videos are displayed on your product pages."
        fields={[
          {
            id: "video_placement",
            label: "Video Placement",
            render: () => (
              <>
                <ClassicSelect
                  id="video_placement"
                  value={settings.video_placement || "add_to_gallery_last"}
                  onChange={(val) => updateLocalSetting("video_placement", val)}
                  options={[
                    { label: "Inside Product Gallery (Last Slide)", value: "add_to_gallery_last" },
                    { label: "Inside Product Gallery (First Slide)", value: "replace_main_image" },
                    { label: "Below Product Gallery", value: "woocommerce_product_thumbnails" },
                    { label: "Above Product Summary", value: "woocommerce_before_single_product_summary" },
                    { label: "Below Product Summary", value: "woocommerce_after_single_product_summary" },
                  ]}
                />
                <p className="description">Choose where the synced videos should appear on the product page.</p>
              </>
            ),
          },
          {
            id: "muted_autoplay",
            label: "Muted Autoplay",
            render: () => (
              <>
                <ClassicCheckbox
                  id="muted_autoplay"
                  checked={settings.muted_autoplay ?? true}
                  onChange={(checked) => updateLocalSetting("muted_autoplay", checked)}
                  label="Autoplay videos on mute"
                />
                <p className="description">If enabled, videos will start playing automatically without sound when the user scrolls them into view.</p>
              </>
            )
          },
          {
            id: "show_controls",
            label: "Show Player Controls",
            render: () => (
              <>
                <ClassicCheckbox
                  id="show_controls"
                  checked={settings.show_controls ?? true}
                  onChange={(checked) => updateLocalSetting("show_controls", checked)}
                  label="Show YouTube player controls"
                />
                <p className="description">Display play, pause, volume, and fullscreen buttons on the video player.</p>
              </>
            )
          }
        ]}
      />
    </>
  );
};
