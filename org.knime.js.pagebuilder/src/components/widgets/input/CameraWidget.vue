<script>
import Label from 'webapps-common/ui/components/forms/Label';
import Button from 'webapps-common/ui/components/Button';
import ToggleSwitch from 'webapps-common/ui/components/forms/ToggleSwitch';
import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';

const DATA_TYPE_KEY = 'string';

const FALLBACK_WS_URL = 'ws://localhost:3001';
const FPS = 0.2;

export default {
    components: {
        Label,
        Button,
        ToggleSwitch,
        ErrorMessage
    },
    props: {
        nodeConfig: {
            required: true,
            type: Object,
            validator(obj) {
                return obj.nodeInfo;
            }
        },
        nodeId: {
            required: true,
            type: String,
            validator(nodeId) {
                return nodeId !== '';
            }
        },
        isValid: {
            default: true,
            type: Boolean
        },
        valuePair: {
            default: () => ({
                [DATA_TYPE_KEY]: 0
            }),
            type: Object
        },
        errorMessage: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            usingWebSocket: false,
            capturingInterval: null
        };
    },
    computed: {
        viewRep() {
            return this.nodeConfig.viewRepresentation;
        },
        label() {
            return this.viewRep.label;
        },
        value() {
            return this.valuePair[DATA_TYPE_KEY];
        }
    },
    async mounted() {
        try {
            let stream = await navigator.mediaDevices.getUserMedia({ audio: false,
                video: {
                    facingMode: 'environment',
                    width: 448,
                    height: 448
                } });
            this.$refs.video.srcObject = stream;
        } catch (e) {
            // couldn't access webcam, try to connect to WebSocket (only as work-around while developing)
            consola.log(`Couldn't access webcam, trying to connect to ${FALLBACK_WS_URL}`);
            this.usingWebSocket = true;
            const ws = new WebSocket(FALLBACK_WS_URL);
            ws.onopen = () => {
                consola.log(`Connected to ${FALLBACK_WS_URL}`);
            };
            ws.onmessage = (message) => {
                this.$refs.image.src = message.data;
            };
        }
    },
    beforeDestroy() {
        this.stopContinuousCapturing();
    },
    methods: {
        captureFrame() {
            consola.log('capturing frame');
            let imageDataURL;
            if (this.usingWebSocket) {
                imageDataURL = this.$refs.image.src;
            } else {
                const video = this.$refs.video;
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                const data = canvas.toDataURL('image/png');
                imageDataURL = String(data);
            }
            consola.log('captured frame', imageDataURL);
            const rawBase64 = imageDataURL.replace('data:image/png;base64,', '');
            this.onChange(rawBase64);
        },
        startContinuousCapturing() {
            consola.log('start continuous capturing');
            this.capturingInterval = setInterval(() => {
                this.captureFrame();
            }, 1000 / FPS);
        },
        stopContinuousCapturing() {
            clearInterval(this.capturingInterval);
            this.capturingInterval = null;
        },
        onTakePictureClick() {
            this.captureFrame();
        },
        onContinouslyTakePicturesInput(enable) {
            if (enable) {
                this.captureFrame();
                this.startContinuousCapturing();
            } else {
                this.stopContinuousCapturing();
            }
        },
        onChange(value) {
            const changeEventObj = {
                nodeId: this.nodeId,
                type: DATA_TYPE_KEY,
                value
            };
            this.$emit('updateWidget', changeEventObj);
        },
        validate() {
            return { isValid: true, errorMessage: null };
        }
    }
};
</script>

<template>
  <Label
    :text="label"
  >
    <video
      v-if="!usingWebSocket"
      ref="video"
      autoplay
    />
    <img
      v-else
      ref="image"
    >
    <br>
    <Button
      primary
      @click="onTakePictureClick"
    >take picture</Button>
    &nbsp;
    <ToggleSwitch
      @input="onContinouslyTakePicturesInput"
    >continously take pictures</ToggleSwitch>

    <ErrorMessage :error="errorMessage" />
  </Label>
</template>

<style scoped>
video,
img {
  width: 448px;
  height: 448px;
  margin-bottom: 20px;
  padding: 0;
}
</style>
