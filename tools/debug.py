import mxnet as mx

def debug_record(prefix, waitKey=None):
    data = mx.image.ImageDetIter(1, (3, 512, 512), path_imgrec=prefix)
    for _ in data.draw_next(waitKey=waitKey):
        pass

if __name__ == "__main__":
    debug_record("train.rec", waitKey=0)
