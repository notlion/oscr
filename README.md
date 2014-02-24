## oscr
A Read Eval Print loop for Open Sound Control messages

### Installation
```
$ npm install -g oscr
```

### Usage
Specify outgoing host and port.

```
$ oscr -h localhost -p 7777
```
Specify an incoming port to log OSC messages.

```
$ oscr -h localhost -p 7777 -i 8000
```
Then enter some OSC messages.

```
> /hello iii 1 2 3  # <path> <type-tag> <args>
```
Surround arguments in quotes to preserve spaces.

```
> /say ss "hello world" '\"something\" in quotes'
{ path: '/say',
  typetag: 'ss',
  params: [ 'hello world', '"something" in quotes' ] }
```

##### Snoop
The snoop argument can be used to help debug communication. It will log all incoming messages and immediately redirect them to the outgoing host and port.

```
$ oscr -h localhost -p 8000 -i 9999 -s
```

### Tricks
You can use any valid javascript expression as an argument.

```
> ['','foo','moo'].join('/') "Array(4).join('f') + 'i'" 3-2 "1 + 1" 1*3 Date.now()
{ path: '/foo/moo',
  typetag: 'fffi',
  params: [ 1, 2, 3, 1393227357969 ] }
```
Not that you would want to do this, though...