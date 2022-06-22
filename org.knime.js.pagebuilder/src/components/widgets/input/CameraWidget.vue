<script>
import Label from 'webapps-common/ui/components/forms/Label';
import Button from 'webapps-common/ui/components/Button';
import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';

const DATA_TYPE_KEY = 'value';

const FALLBACK_WS_URL = 'ws://localhost:3001';
const FPS = 0.2;

export default {
    components: {
        Label,
        Button,
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
                [DATA_TYPE_KEY]: ''
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
            // unwrap the value form the array, single selection values are still arrays in the json
            // because they share some impl parts with multiple selection values
            return this.valuePair[DATA_TYPE_KEY][0];
        }
    },
    async mounted() {
        try {
            let stream = await navigator.mediaDevices.getUserMedia({ video: { width: 426, height: 240 } });
            this.$refs.video.srcObject = stream;
            this.startContinuousCapturing();
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

                // start capturing on first message
                if (!this.capturingInterval) {
                    this.startContinuousCapturing();
                }
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
        },
        onTakePictureClick() {
            this.stopContinuousCapturing();
            this.captureFrame();
        },
        onChange(value) {
            const changeEventObj = {
                nodeId: this.nodeId,
                type: DATA_TYPE_KEY,
                value: [value]
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
    
    <ErrorMessage :error="errorMessage" />
  </Label>
</template>

<style scoped>
video,
img {
  width: 436px;
  height: 240px;
}
</style>
